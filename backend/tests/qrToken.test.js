import { describe, expect, test } from "@jest/globals";
import { generateQRToken, validateQRToken } from "../src/services/qrToken.js";

// Mock environment variables
process.env.QR_SECRET = "test-secret-key";
process.env.QR_TOKEN_EXPIRY = "300"; // 5 minutes

describe("QR Token Service", () => {
  test("should generate a valid token", () => {
    const sessionId = 1;
    const token = generateQRToken(sessionId);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(":").length).toBe(3); // sessionId:timestamp:signature
  });

  test("should validate a valid token", () => {
    const sessionId = 1;
    const token = generateQRToken(sessionId);

    const result = validateQRToken(token);

    expect(result.valid).toBe(true);
    expect(result.sessionId).toBe(sessionId);
    expect(result.timestamp).toBeDefined();
  });

  test("should reject a token with invalid signature", () => {
    const token = "1:1234567890:invalidsignature";

    const result = validateQRToken(token);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid token signature");
  });

  test("should reject an expired token", async () => {
    const sessionId = 1;
    const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    const crypto = await import("crypto");
    const payload = `${sessionId}:${oldTimestamp}`;
    const signature = crypto
      .createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");
    const expiredToken = `${payload}:${signature}`;

    const result = validateQRToken(expiredToken);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Token expired");
  });

  test("should reject a token with invalid format", () => {
    const token = "invalid:token";

    const result = validateQRToken(token);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid token format");
  });

  test("should reject a forged token (wrong secret)", async () => {
    const sessionId = 1;
    const timestamp = Date.now();
    const crypto = await import("crypto");
    const payload = `${sessionId}:${timestamp}`;
    const wrongSignature = crypto
      .createHmac("sha256", "wrong-secret")
      .update(payload)
      .digest("hex");
    const forgedToken = `${payload}:${wrongSignature}`;

    const result = validateQRToken(forgedToken);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid token signature");
  });

  test("should generate different tokens for different sessions", () => {
    const token1 = generateQRToken(1);
    const token2 = generateQRToken(2);

    expect(token1).not.toBe(token2);

    const result1 = validateQRToken(token1);
    const result2 = validateQRToken(token2);

    expect(result1.sessionId).toBe(1);
    expect(result2.sessionId).toBe(2);
  });
});
