import { Router } from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  verifyPayment,
} from "../../controllers/payment-controller/index.js";
import { verifyToken } from "../../middleware/auth-middleware.js";

const router = Router();

// Checkout requires auth
router.post("/checkout", verifyToken, createCheckoutSession);

// Verify payment after redirect
router.post("/verify", verifyToken, verifyPayment);

export default router;