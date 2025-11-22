import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import attendanceRoutes from "./routes/attendance.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Trust proxy for ngrok and reverse proxies
app.set("trust proxy", 1);

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    // Allow ngrok URLs
    if (origin.includes("ngrok")) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("Server error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
  console.log(
    `🌐 Public URL: ${process.env.PUBLIC_BACKEND_URL || `http://localhost:${PORT}`
    }`
  );
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
