import express from "express";
import {
  registerUser,
  loginUser,
} from "../../controllers/auth-controller/index.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get("/check-auth");

export default router;
