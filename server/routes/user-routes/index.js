import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUser,
  deleteUser,
  getAdminStats,
  getEnrollmentStats,
  createUser,
  resetUserPassword,
  suspendUser,
  activateUser,
  getUserActivityLogs,
  getAllActivityLogs,
} from "../../controllers/user-controller/index.js";
import { verifyToken, verifyRole } from "../../middleware/auth-middleware.js";

const router = express.Router();

// Apply authentication and admin role verification to all routes
router.use(verifyToken);
router.use(verifyRole("admin"));

// Get all users
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Create new user
router.post("/", createUser);

// Update user role
router.put("/:id/role", updateUserRole);

// Update user
router.put("/:id", updateUser);

// Reset user password
router.post("/:id/reset-password", resetUserPassword);

// Suspend user
router.put("/:id/suspend", suspendUser);

// Activate user
router.put("/:id/activate", activateUser);

// Delete user
router.delete("/:id", deleteUser);

// Get admin stats
router.get("/admin/stats", getAdminStats);

// Get enrollment stats for chart
router.get("/admin/enrollment-stats", getEnrollmentStats);

// Get user activity logs
router.get("/:id/activity", getUserActivityLogs);

// Get all activity logs
router.get("/activity/all", getAllActivityLogs);

export default router;
