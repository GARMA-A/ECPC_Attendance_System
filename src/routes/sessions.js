import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import {
  createQRTokenRecord,
  generateQRCodeDataURL,
  cleanupExpiredTokens,
} from "../services/qrToken.js";

const router = express.Router();
const prisma = new PrismaClient();

// Create a new session (Instructor only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  async (req, res) => {
    try {
      const { name, courseName, date } = req.body;

      if (!name || !courseName || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const session = await prisma.session.create({
        data: {
          name,
          courseName,
          date: new Date(date),
          createdBy: req.user.id,
        },
      });

      return res.json({ success: true, session });
    } catch (error) {
      console.error("Create session error:", error);
      return res.status(500).json({ error: "Failed to create session" });
    }
  }
);

// Get all sessions
router.get("/", authMiddleware, async (_, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        creator: {
          select: {
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return res.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Get session by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        creator: {
          select: {
            name: true,
            username: true,
          },
        },
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                groupName: true,
              },
            },
          },
          orderBy: {
            scannedAt: "asc",
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.json({ session });
  } catch (error) {
    console.error("Get session error:", error);
    return res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Generate QR code for session
router.get(
  "/:id/qr",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);

      // Verify session exists
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Clean up old tokens periodically
      await cleanupExpiredTokens();

      // Create new token
      const { token, expiresAt } = await createQRTokenRecord(sessionId);

      // Generate QR code
      const qrDataURL = await generateQRCodeDataURL(token);

      return res.json({
        success: true,
        token,
        expiresAt,
        qrCode: qrDataURL,
        expiresIn: parseInt(process.env.QR_TOKEN_EXPIRY) || 300,
      });
    } catch (error) {
      console.error("Generate QR error:", error);
      return res.status(500).json({ error: "Failed to generate QR code" });
    }
  }
);

// Get session attendance (with optional CSV export)
router.get(
  "/:id/attendance",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const format = req.query.format;

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          attendances: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  groupName: true,
                },
              },
            },
            orderBy: {
              scannedAt: "asc",
            },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (format === "csv") {
        // Generate CSV
        const csvRows = [
          ["ID", "Name", "Username", "Group", "Scanned At", "IP Address"],
          ...session.attendances.map((att) => [
            att.user.id,
            att.user.name,
            att.user.username,
            att.user.groupName || "",
            new Date(att.scannedAt).toLocaleString(),
            att.ipAddress || "",
          ]),
        ];

        const csv = csvRows
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="attendance-${sessionId}.csv"`
        );
        return res.send(csv);
      }

      return res.json({ attendances: session.attendances });
    } catch (error) {
      console.error("Get attendance error:", error);
      return res.status(500).json({ error: "Failed to fetch attendance" });
    }
  }
);

router.delete("/:id",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);

      const session = await prisma.session.findUnique({ where: { id: sessionId } })
      if (!session) {
        return res.status("400").json({ error: "session not exist" })
      }
      await prisma.session.delete({
        where: { id: sessionId },
      });

      return res.json({ success: true, message: "Session deleted" });
    } catch (error) {
      console.error("Delete session error:", error);
      return res.status(500).json({ error: "Failed to delete session", realError: error });
    }
  });

export default router;
