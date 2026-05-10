import Chapter from "../../models/Chapter.js";
import { uploadVideoToCloudinary } from "../../helpers/cloudinary.js";
import fs from "fs/promises";

// Add chapter to a course
export const addChapter = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    const chapterCount = await Chapter.countDocuments({ courseId });

    const chapter = await Chapter.create({
      title,
      courseId,
      position: chapterCount,
    });

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update chapter
export const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete chapter
export const deleteChapter = async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add lesson to chapter
export const addLesson = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    const lesson = {
      title: req.body.title,
      description: req.body.description || "",
      videoUrl: req.body.videoUrl || "",
      videoKey: req.body.videoKey || "",
      position: chapter.lessons.length,
      freePreview: req.body.freePreview || false,
      duration: req.body.duration || 0,
    };

    chapter.lessons.push(lesson);
    await chapter.save();

    res.status(201).json({
      success: true,
      data: chapter.lessons[chapter.lessons.length - 1],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lesson
export const updateLesson = async (req, res) => {
  try {
    const { chapterId, lessonId } = req.params;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    const lesson = chapter.lessons.id(lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    Object.assign(lesson, req.body);
    await chapter.save();

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const { chapterId, lessonId } = req.params;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    chapter.lessons.pull(lessonId);
    await chapter.save();

    res
      .status(200)
      .json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reorder chapters
export const reorderChapters = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapters } = req.body; // [{ id: string, position: number }]

    for (const ch of chapters) {
      await Chapter.findByIdAndUpdate(ch.id, { position: ch.position });
    }

    res.status(200).json({ success: true, message: "Chapters reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reorder lessons within a chapter
export const reorderLessons = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { lessons } = req.body; // [{ id: string, position: number }]

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    for (const lessonUpdate of lessons) {
      const lesson = chapter.lessons.id(lessonUpdate.id);
      if (lesson) {
        lesson.position = lessonUpdate.position;
      }
    }

    await chapter.save();
    res.status(200).json({ success: true, message: "Lessons reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chapters for a course
export const getCourseChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ courseId: req.params.courseId }).sort(
      { position: 1 }
    );
    res.status(200).json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload video for a lesson
export const uploadLessonVideo = async (req, res) => {
  try {
    const { chapterId, lessonId } = req.params;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    // Find chapter and lesson
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    const lesson = chapter.lessons.id(lessonId);
    if (!lesson) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadVideoToCloudinary(req.file.path);

    // Update lesson with video URL and key
    lesson.videoUrl = cloudinaryResult.secure_url;
    lesson.videoKey = cloudinaryResult.public_id;

    await chapter.save();

    // Clean up temp file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      data: lesson,
      message: "Video uploaded successfully",
    });
  } catch (error) {
    // Clean up temp file if exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        // ignore cleanup error
      }
    }

    console.error("Lesson video upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload video",
    });
  }
};