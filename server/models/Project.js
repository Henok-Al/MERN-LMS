import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    type: {
      type: String,
      enum: ["individual", "group"],
      default: "individual",
    },
    maxScore: { type: Number, default: 100 },
    dueDate: Date,
    attachments: [{ name: String, url: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);