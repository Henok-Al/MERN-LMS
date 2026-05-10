import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../../controllers/project-controller/index.js";
import { verifyToken, verifyRole } from "../../middleware/auth-middleware.js";

const router = Router();

// All routes require authentication and instructor/admin role
router.use(verifyToken);
router.use(verifyRole(["instructor", "admin"]));

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;