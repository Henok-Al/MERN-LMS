import { Router } from "express";
import {
  registerUser,
  loginUser,
  checkAuth,
  forgotPassword,
  resetPassword,
  googleAuth,
} from "../../controllers/auth-controller/index.js";
import {
  getProfile,
  getProfileStats,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../../controllers/profile-controller/index.js";
import { verifyToken } from "../../middleware/auth-middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", verifyToken, checkAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth);

// Profile routes
router.get("/profile", verifyToken, getProfile);
router.get("/profile/stats", verifyToken, getProfileStats);
router.put("/profile", verifyToken, updateProfile);
router.put("/profile/password", verifyToken, changePassword);
router.delete("/profile", verifyToken, deleteAccount);

export default router;
