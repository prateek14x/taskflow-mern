import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

// Start database connection in the background (don't block server startup)
dbConnection().catch(err => console.error("Database connection error:", err));

const port = process.env.PORT || 5000;

const app = express();

// Trust proxy - important for Railway
app.set("trust proxy", 1);

// CORS - MUST be first middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 200,
  maxAge: 3600,
}));

// Handle preflight requests explicitly
app.options("*", cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
}));

// Manual CORS header middleware - backup for safety
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Max-Age", "3600");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Origin:", req.get("origin"));
  next();
});

app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "Server is running", 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API routes
app.use("/api", routes);

// Catch-all route for debugging
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
    available: "/api and /health"
  });
});

// Error handling
app.use(routeNotFound);
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`\n✅ Server listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
