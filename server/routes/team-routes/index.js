import { Router } from "express";
import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
} from "../../controllers/team-controller/index.js";
import { verifyToken, verifyRole } from "../../middleware/auth-middleware.js";

const router = Router();

// All team routes require authentication and instructor/admin role
router.use(verifyToken);
router.use(verifyRole(["instructor", "admin"]));

router.get("/", getTeamMembers);
router.post("/invite", inviteTeamMember);
router.put("/:id/role", updateTeamMemberRole);
router.delete("/:id", removeTeamMember);

export default router;