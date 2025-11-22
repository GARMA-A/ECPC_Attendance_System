import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalide username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user);

    // Set HTTP-only cookie
    const isSecure = process.env.COOKIE_SECURE === "true";
    const sameSite = process.env.COOKIE_SAME_SITE || "lax";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        groupName: user.groupName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Signup
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { username, password, name, groupName, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: "Username, password, and name are required" });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        groupName,
        role: role || "student",
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        groupName: true,
        createdAt: true,
      },
    });

    console.log("Created new user:", newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Logout
router.post("/logout", (_, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out successfully" });
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { verifyToken } = await import("../utils/jwt.js");
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        groupName: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
