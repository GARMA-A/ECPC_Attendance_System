import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { attendanceLimiter } from "../middleware/rateLimiter.js";
import { recordAttendance } from "../services/attendance.js";

const router = express.Router();

// Record attendance by scanning QR code
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  attendanceLimiter,
  async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: "Token is required",
          errorAr: "الرمز مطلوب",
        });
      }

      const metadata = {
        ipAddress:
          req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
          req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      };

      const result = await recordAttendance(req.user.id, token, metadata);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error("Record attendance error:", error);
      return res.status(500).json({
        error: "Internal server error",
        errorAr: "خطأ في الخادم",
      });
    }
  }
);

// Direct scan endpoint (for QR code redirect)
router.get(
  "/scan",
  authMiddleware,
  roleMiddleware("student"),
  attendanceLimiter,
  async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>خطأ - Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; direction: rtl; }
            .error { color: #d32f2f; font-size: 20px; }
          </style>
        </head>
        <body>
          <h1 class="error">خطأ: الرمز مفقود</h1>
          <p class="error">Error: Token is missing</p>
        </body>
        </html>
      `);
      }

      const metadata = {
        ipAddress:
          req.ip ||
          req.headers["x-forwarded-for"] ||
          req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      };

      const result = await recordAttendance(req.user.id, token, metadata);

      if (!result.success) {
        return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>فشل - Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; direction: rtl; }
            .error { color: #d32f2f; }
            .message { font-size: 20px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1 class="error">فشل تسجيل الحضور</h1>
          <p class="message">${result.errorAr}</p>
          <hr>
          <p class="error">Attendance Failed</p>
          <p class="message">${result.error}</p>
        </body>
        </html>
      `);
      }

      return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>نجح - Success</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; direction: rtl; }
          .success { color: #388e3c; }
          .message { font-size: 20px; margin: 20px; }
          .details { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 500px; }
        </style>
      </head>
      <body>
        <h1 class="success">✓ تم تسجيل حضورك بنجاح</h1>
        <div class="details">
          <p><strong>الجلسة:</strong> ${result.attendance.sessionName}</p>
          <p><strong>المادة:</strong> ${result.attendance.courseName}</p>
          <p><strong>الوقت:</strong> ${new Date(
        result.attendance.scannedAt
      ).toLocaleString("ar-EG")}</p>
        </div>
        <hr>
        <h2 class="success">✓ Attendance Recorded Successfully</h2>
        <div class="details">
          <p><strong>Session:</strong> ${result.attendance.sessionName}</p>
          <p><strong>Course:</strong> ${result.attendance.courseName}</p>
          <p><strong>Time:</strong> ${new Date(
        result.attendance.scannedAt
      ).toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);
    } catch (error) {
      console.error("Scan attendance error:", error);
      return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>خطأ - Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; direction: rtl; }
          .error { color: #d32f2f; font-size: 20px; }
        </style>
      </head>
      <body>
        <h1 class="error">خطأ في الخادم</h1>
        <p class="error">Server Error</p>
      </body>
      </html>
    `);
    }
  }
);

export default router;
