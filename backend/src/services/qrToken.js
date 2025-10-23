import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();
const QR_SECRET = process.env.QR_SECRET || "your-qr-secret";
const QR_TOKEN_EXPIRY = parseInt(process.env.QR_TOKEN_EXPIRY) || 300; // 5 minutes default
const PUBLIC_BACKEND_URL =
  process.env.PUBLIC_BACKEND_URL || "http://localhost:3000";

export function generateQRToken(sessionId) {
  const timestamp = Date.now();
  const payload = `${sessionId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex");

  return `${payload}:${signature}`;
}

export function validateQRToken(token) {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [sessionId, timestamp, signature] = parts;
    const payload = `${sessionId}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", QR_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid token signature" };
    }

    const tokenAge = (Date.now() - parseInt(timestamp)) / 1000;
    if (tokenAge > QR_TOKEN_EXPIRY) {
      return { valid: false, error: "Token expired" };
    }

    return {
      valid: true,
      sessionId: parseInt(sessionId),
      timestamp: parseInt(timestamp),
    };
  } catch (error) {
    return { valid: false, error: "Token validation failed" };
  }
}

export async function createQRTokenRecord(sessionId) {
  const token = generateQRToken(sessionId);
  const expiresAt = new Date(Date.now() + QR_TOKEN_EXPIRY * 1000);

  await prisma.qRToken.create({
    data: {
      token,
      sessionId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function cleanupExpiredTokens() {
  const now = new Date();
  await prisma.qRToken.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });
}

export async function generateQRCodeDataURL(token) {
  const url = `${PUBLIC_BACKEND_URL}/api/attendance/scan?token=${encodeURIComponent(
    token
  )}`;
  const dataURL = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
  return dataURL;
}
