import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config();

console.log("🚀 Starting server...");

const port = process.env.PORT || 5000;
const app = express();

// ============ CORS - FIRST ============
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));

// ============ Parsers ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ============ Health endpoint - ALWAYS WORKS ============
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============ Start server FIRST ============
const server = app.listen(port, () => {
  console.log(`\n✅ EXPRESS SERVER LISTENING ON PORT ${port}`);
  console.log(`📍 Test: http://localhost:${port}/health\n`);
});

// ============ Load routes asynchronously ============
(async () => {
  try {
    console.log("📦 Loading modules...");
    
    const { default: routes } = await import("./routes/index.js");
    const { errorHandler, routeNotFound } = await import("./middleware/errorMiddleware.js");
    
    console.log("✅ Modules loaded");
    
    app.use("/api", routes);
    app.use(routeNotFound);
    app.use(errorHandler);
    
    console.log("✅ Routes registered");
  } catch (error) {
    console.error("❌ Error loading routes:", error.message);
    console.error(error);
  }
  
  // Try database connection
  try {
    console.log("🔗 Connecting to MongoDB...");
    const { default: dbConnection } = await import("./utils/connectDB.js");
    const connected = await dbConnection();
    if (connected) {
      console.log("✅ MongoDB connected");
    }
  } catch (error) {
    console.warn("⚠️ MongoDB error (non-critical):", error.message);
  }
})();

// ============ Error handling ============
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received");
  server.close(() => process.exit(0));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});
