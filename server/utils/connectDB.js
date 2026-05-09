import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI environment variable not set");
      return false;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Database Connected");
    return true;
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    return false;
  }
};

export default dbConnection;
