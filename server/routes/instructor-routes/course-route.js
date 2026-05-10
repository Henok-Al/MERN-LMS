import { Router } from "express";
import { verifyToken, verifyRole } from "../../middleware/auth-middleware.js";
import { getInstructorStats } from "../../controllers/instructor-controller/course-controller.js";

const router = Router();

// Instructor stats
router.get(
  "/stats",
  verifyToken,
  verifyRole(["instructor", "admin"]),
  getInstructorStats
);

export default router;