import { Router } from "express";
import {
  getAllCourses,
  getCourseBySlug,
  getCourseSidebarData,
  getEnrolledCourses,
  enrollCourse,
  updateLessonProgress,
  createCourse,
  updateCourse,
  getMyCourses,
  getCourseById,
  deleteCourse,
  getAllCoursesAdmin,
  uploadVideo,
  getCourseVideos,
  deleteVideo,
} from "../../controllers/course-controller/index.js";
import {
  addChapter,
  updateChapter,
  deleteChapter,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseChapters,
  reorderChapters,
  reorderLessons,
  uploadLessonVideo,
} from "../../controllers/chapter-controller/index.js";
import { verifyToken, verifyRole } from "../../middleware/auth-middleware.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

// Public routes (no auth needed)
router.get("/published", getAllCourses);
router.get("/slug/:slug", getCourseBySlug);

// Protected routes (student)
router.get("/enrolled", verifyToken, getEnrolledCourses);
router.post("/enroll", verifyToken, enrollCourse);
router.post("/lesson-progress", verifyToken, updateLessonProgress);
router.get("/sidebar/:courseId", verifyToken, getCourseSidebarData);

// Admin routes - get all courses (including drafts)
router.get("/admin/all", verifyToken, verifyRole("admin"), getAllCoursesAdmin);

// Instructor routes
router.post("/", verifyToken, verifyRole(["instructor", "admin"]), createCourse);
router.get("/my-courses", verifyToken, verifyRole(["instructor", "admin"]), getMyCourses);
router.get("/:id", verifyToken, verifyRole(["instructor", "admin"]), getCourseById);
router.get("/:id/edit", verifyToken, verifyRole(["instructor", "admin"]), getCourseById);
router.put("/:id", verifyToken, verifyRole(["instructor", "admin"]), updateCourse);
router.delete("/:id", verifyToken, verifyRole(["instructor", "admin"]), deleteCourse);

// Chapter routes (instructor/admin)
router.post(
  "/chapters",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  addChapter
);
router.put(
  "/chapters/:id",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  updateChapter
);
router.delete(
  "/chapters/:id",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  deleteChapter
);
router.get("/:courseId/chapters", verifyToken, getCourseChapters);
router.put("/:courseId/chapters/reorder", verifyToken, verifyRole(["instructor", "admin"]), reorderChapters);
router.put("/chapters/:chapterId/lessons/reorder", verifyToken, verifyRole(["instructor", "admin"]), reorderLessons);

// Lesson routes (instructor/admin)
router.post(
  "/chapters/:chapterId/lessons",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  addLesson
);
router.put(
  "/chapters/:chapterId/lessons/:lessonId",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  updateLesson
);
router.delete(
  "/chapters/:chapterId/lessons/:lessonId",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  deleteLesson
);

// Upload video for a specific lesson
router.post(
  "/chapters/:chapterId/lessons/:lessonId/video",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  upload.single("video"),
  uploadLessonVideo
);

// Video routes (instructor/admin)
router.post(
  "/:courseId/videos",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  upload.single("video"),
  uploadVideo
);

router.get("/:courseId/videos", verifyToken, getCourseVideos);

router.delete(
  "/:courseId/videos/:videoId",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  deleteVideo
);

export default router;