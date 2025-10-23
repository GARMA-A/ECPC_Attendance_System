import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getUserAttendanceStats } from "../services/attendance.js";

const router = express.Router();

// Get user statistics
router.get("/:id/stats", authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Students can only access their own stats
    if (req.user.role === "student" && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const stats = await getUserAttendanceStats(userId);

    if (!stats) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(stats);
  } catch (error) {
    console.error("Get user stats error:", error);
    return res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;
