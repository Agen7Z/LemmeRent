import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
    default: "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-profile-picture-suitable-social-media-profiles-icons-screensawsers-as-templatex9xa_719432-1040.jpg?semt=ais_hybrid",
  },
  isAdmin: {
    type: Boolean,
    default: false, // Default to false for regular users
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;