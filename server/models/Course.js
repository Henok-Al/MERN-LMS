import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    category: { type: String, default: "General" },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    primaryLanguage: { type: String, default: "English" },
    subtitle: String,
    smallDescription: { type: String, maxlength: 300 },
    description: { type: String },
    image: String,
    fileKey: String,
    welcomeMessage: String,
    pricing: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // in hours
    objectives: String,
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);