import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import Task from "./models/taskModel.js";

dotenv.config();

const users = [
  {
    name: "Admin User",
    title: "Administrator",
    role: "Admin",
    email: "admin@example.com",
    password: "password123",
    isAdmin: true,
  },
  {
    name: "System Manager",
    title: "Product Manager",
    role: "Manager",
    email: "manager@example.com",
    password: "password123",
    isAdmin: true,
  },
  {
    name: "John Doe",
    title: "Frontend Developer",
    role: "User",
    email: "john@example.com",
    password: "password123",
    isAdmin: false,
  },
  {
    name: "Jane Smith",
    title: "Backend UI UX",
    role: "User",
    email: "jane@example.com",
    password: "password123",
    isAdmin: false,
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear db collections completely to avoid index conflicts
    await mongoose.connection.db.dropCollection("users").catch(() => {});
    await mongoose.connection.db.dropCollection("tasks").catch(() => {});

    // insert users correctly to trigger password hashing
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    
    console.log("Users created successfully!");

    const tasks = [
      {
        title: "Design New Landing Page",
        date: new Date(),
        priority: "high",
        stage: "todo",
        team: [createdUsers[3]._id, createdUsers[0]._id],
        activities: [{ type: "assigned", activity: "Assigned for planning", by: createdUsers[0]._id }],
        subTasks: [{ title: "Create Mockups", date: new Date(), tag: "Design" }]
      },
      {
        title: "Build Authentication System",
        date: new Date(),
        priority: "high",
        stage: "in progress",
        team: [createdUsers[2]._id],
        activities: [{ type: "started", activity: "Working on JWT implementation", by: createdUsers[2]._id }]
      },
      {
        title: "Create Database Schema",
        date: new Date(),
        priority: "medium",
        stage: "completed",
        team: [createdUsers[2]._id, createdUsers[3]._id],
        activities: [{ type: "completed", activity: "Finished creating mongoose models", by: createdUsers[2]._id }]
      },
      {
        title: "Setup Deployment Pipeline",
        date: new Date(),
        priority: "low",
        stage: "todo",
        team: [createdUsers[1]._id],
        activities: [{ type: "assigned", activity: "Need to configure Render and Vercel", by: createdUsers[0]._id }]
      }
    ];

    await Task.insertMany(tasks);
    console.log("Tasks created successfully!");
    console.log("Demo Database Seeded. Exiting...");
    process.exit(0);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedDB();
