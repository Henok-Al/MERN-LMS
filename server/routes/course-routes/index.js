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
} from "../../controllers/course-controller/index.js";
import {
  addChapter,
  updateChapter,
  deleteChapter,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseChapters,
} from "../../controllers/chapter-controller/index.js";
import { verifyToken, verifyRole } from "../../middleware/auth-middleware.js";

const router = Router();

// Public routes (no auth needed)
router.get("/published", getAllCourses);
router.get("/slug/:slug", getCourseBySlug);

// Protected routes (student)
router.get("/enrolled", verifyToken, getEnrolledCourses);
router.post("/enroll", verifyToken, enrollCourse);
router.post("/lesson-progress", verifyToken, updateLessonProgress);
router.get("/sidebar/:courseId", verifyToken, getCourseSidebarData);

// Instructor routes
router.post("/", verifyToken, verifyRole(["instructor"]), createCourse);
router.get("/my-courses", verifyToken, verifyRole(["instructor"]), getMyCourses);
router.get("/:id", verifyToken, verifyRole(["instructor"]), getCourseById);
router.put("/:id", verifyToken, verifyRole(["instructor"]), updateCourse);
router.delete("/:id", verifyToken, verifyRole(["instructor"]), deleteCourse);

// Chapter routes (instructor)
router.post(
  "/chapters",
  verifyToken,
  verifyRole(["instructor"]),
  addChapter
);
router.put(
  "/chapters/:id",
  verifyToken,
  verifyRole(["instructor"]),
  updateChapter
);
router.delete(
  "/chapters/:id",
  verifyToken,
  verifyRole(["instructor"]),
  deleteChapter
);
router.get("/:courseId/chapters", verifyToken, getCourseChapters);

// Lesson routes (instructor)
router.post(
  "/chapters/:chapterId/lessons",
  verifyToken,
  verifyRole(["instructor"]),
  addLesson
);
router.put(
  "/chapters/:chapterId/lessons/:lessonId",
  verifyToken,
  verifyRole(["instructor"]),
  updateLesson
);
router.delete(
  "/chapters/:chapterId/lessons/:lessonId",
  verifyToken,
  verifyRole(["instructor"]),
  deleteLesson
);

export default router;