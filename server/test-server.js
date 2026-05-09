import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// CORS first
app.use(cors({ origin: true, credentials: true }));

// Health check only
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`✅ TEST SERVER RUNNING ON PORT ${port}`);
  console.log(`Try: http://localhost:${port}/health`);
});
