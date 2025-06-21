import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    experience: { type: String, required: true },
    rate: { type: String, required: true },
    specialties: { type: [String], required: true },
    availability: { type: String, required: true },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value for rating.",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Worker", WorkerSchema);