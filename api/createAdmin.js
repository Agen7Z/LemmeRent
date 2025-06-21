import bcryptjs from "bcryptjs";
import User from "./models/user.model.js"; // Adjust the path as needed
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file outside the api folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log the MONGO_URL to verify it's being loaded correctly
console.log("MONGO_URL:", process.env.MONGO_URL);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdmin = async () => {
  const hashedPassword = bcryptjs.hashSync("madebykrisham", 10); // Hash the password
  const adminUser = new User({
    username: "admin",
    email: "admin@example.com",
    password: hashedPassword,
    isAdmin: true,
  });

  try {
    await adminUser.save();
    console.log("Admin user created successfully!");
  } catch (err) {
    console.error("Error creating admin user:", err);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
};

createAdmin();