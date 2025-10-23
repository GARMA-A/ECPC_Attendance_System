import { PrismaClient } from "@prisma/client";
import { validateQRToken } from "./qrToken.js";
import logger from "../utils/logger.js";

const prisma = new PrismaClient();

export async function recordAttendance(userId, token, metadata = {}) {
  try {
    const validation = validateQRToken(token);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        errorAr: "رمز QR غير صالح أو منتهي الصلاحية",
      };
    }

    const { sessionId } = validation;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return {
        success: false,
        error: "Session not found",
        errorAr: "الجلسة غير موجودة",
      };
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        error: "Attendance already recorded",
        errorAr: "تم تسجيل حضورك مسبقاً",
      };
    }

    // Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        sessionId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        latitude: metadata.latitude,
        longitude: metadata.longitude,
      },
      include: {
        session: true,
        user: true,
      },
    });

    logger.info("Attendance recorded", {
      userId,
      sessionId,
      attendanceId: attendance.id,
    });

    return {
      success: true,
      message: "Attendance recorded successfully",
      messageAr: "تم تسجيل حضورك بنجاح",
      attendance: {
        id: attendance.id,
        sessionName: attendance.session.name,
        courseName: attendance.session.courseName,
        scannedAt: attendance.scannedAt,
      },
    };
  } catch (error) {
    logger.error("Error recording attendance", {
      error: error.message,
      userId,
      token,
    });
    return {
      success: false,
      error: "Failed to record attendance",
      errorAr: "فشل في تسجيل الحضور",
    };
  }
}

export async function getUserAttendanceStats(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attendances: {
          include: {
            session: true,
          },
          orderBy: {
            scannedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Get total sessions for the user's group
    const totalSessions = await prisma.session.count();

    const attendanceCount = user.attendances.length;
    const absenceCount = Math.max(0, totalSessions - attendanceCount);

    // Weekly breakdown (last 8 weeks)
    const weeklyData = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekAttendances = user.attendances.filter((att) => {
        const attDate = new Date(att.scannedAt);
        return attDate >= weekStart && attDate < weekEnd;
      });

      const weekSessions = await prisma.session.count({
        where: {
          date: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      });

      weeklyData.push({
        week: `Week ${8 - i}`,
        weekStart: weekStart.toISOString(),
        attended: weekAttendances.length,
        absent: Math.max(0, weekSessions - weekAttendances.length),
        total: weekSessions,
      });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        groupName: user.groupName,
      },
      stats: {
        totalSessions,
        attendanceCount,
        absenceCount,
        attendanceRate:
          totalSessions > 0
            ? ((attendanceCount / totalSessions) * 100).toFixed(2)
            : 0,
      },
      weeklyBreakdown: weeklyData,
      recentAttendances: user.attendances.slice(0, 10).map((att) => ({
        id: att.id,
        sessionName: att.session.name,
        courseName: att.session.courseName,
        date: att.session.date,
        scannedAt: att.scannedAt,
      })),
    };
  } catch (error) {
    logger.error("Error getting user stats", { error: error.message, userId });
    throw error;
  }
}
