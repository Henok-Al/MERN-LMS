import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  videoKey: String,
  thumbnailKey: String,
  position: { type: Number, default: 0 },
  freePreview: { type: Boolean, default: false },
  duration: { type: Number, default: 0 }, // in minutes
});

const ChapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    position: { type: Number, default: 0 },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessons: [LessonSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", ChapterSchema);