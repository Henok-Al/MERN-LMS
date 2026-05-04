import mongoose from "mongoose";

const LessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("LessonProgress", LessonProgressSchema);