import { Router } from "express";
import {
  getCourseReviews,
  addReview,
  deleteReview,
} from "../../controllers/review-controller/index.js";
import { verifyToken } from "../../middleware/auth-middleware.js";

const router = Router();

// Public routes
router.get("/:courseId", getCourseReviews);

// Protected routes
router.post("/", verifyToken, addReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;