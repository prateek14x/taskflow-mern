import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

// Trust proxy - important for Railway
app.set("trust proxy", 1);

// ============ CORS - MUST be first ============
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 200,
  maxAge: 3600,
}));

// Preflight handler
app.options("*", cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
}));

// Manual CORS headers - backup
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ============ Body parsers ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============ Logging ============
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
app.use(morgan("dev"));

// ============ Health check - MUST work ============
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============ API routes ============
app.use("/api", routes);

// ============ Error handling ============
app.use(routeNotFound);
app.use(errorHandler);

// ============ START SERVER FIRST ============
const server = app.listen(port, () => {
  console.log(`\n✅ SERVER STARTED ON PORT ${port}`);
  console.log(`Health: http://localhost:${port}/health\n`);
  
  // THEN try to connect to database in background
  console.log("Attempting to connect to MongoDB...");
  dbConnection()
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("⚠️ MongoDB Connection Error (non-fatal):", err.message));
});

// ============ Graceful shutdown ============
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  // Don't exit - keep server running
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  // Don't exit - keep server running
});
