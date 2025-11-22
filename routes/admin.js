import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  async (_, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          groupName: true,
          createdAt: true,
          _count: {
            select: {
              attendances: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// Delete attendance record (Admin only)
router.delete(
  "/attendance/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const attendanceId = parseInt(req.params.id);

      await prisma.attendance.delete({
        where: { id: attendanceId },
      });

      return res.json({ success: true, message: "Attendance record deleted" });
    } catch (error) {
      console.error("Delete attendance error:", error);
      return res
        .status(500)
        .json({ error: "Failed to delete attendance record" });
    }
  }
);

router.delete("/user/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id)
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) {
        return res.status(400).json({ error: "no user was found" })
      }
      await prisma.user.delete({ where: { id } })
      return res.json({ success: true, message: "User deleted successfully" })
    } catch (error) {
      return res.json({ error })
    }
  }
)

// Manually add attendance record (Admin only)
router.post(
  "/attendance",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { userId, sessionId } = req.body;

      if (!userId || !sessionId) {
        return res
          .status(400)
          .json({ error: "userId and sessionId are required" });
      }

      // Check if already exists
      const existing = await prisma.attendance.findUnique({
        where: {
          userId_sessionId: {
            userId: parseInt(userId),
            sessionId: parseInt(sessionId),
          },
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({ error: "Attendance record already exists" });
      }

      const attendance = await prisma.attendance.create({
        data: {
          userId: parseInt(userId),
          sessionId: parseInt(sessionId),
        },
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
          session: {
            select: {
              name: true,
              courseName: true,
            },
          },
        },
      });

      return res.json({ success: true, attendance });
    } catch (error) {
      console.error("Add attendance error:", error);
      return res.status(500).json({ error: "Failed to add attendance record" });
    }
  }
);

// Get all attendance records (Admin only)
router.get(
  "/attendance",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [attendances, total] = await Promise.all([
        prisma.attendance.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                groupName: true,
              },
            },
            session: {
              select: {
                id: true,
                name: true,
                courseName: true,
                date: true,
              },
            },
          },
          orderBy: {
            scannedAt: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.attendance.count(),
      ]);

      return res.json({
        attendances,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get all attendance error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch attendance records" });
    }
  }
);

export default router;
