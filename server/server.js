import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./database/db.js";
import authRoute from "./routes/auth-routes/index.js";
import instructorRoute from "./routes/instructor-routes/course-route.js";
import mediaRoutes from "./routes/instructor-routes/media-routes.js";
import courseRoutes from "./routes/course-routes/index.js";
import teamRoutes from "./routes/team-routes/index.js";
import projectRoutes from "./routes/project-routes/index.js";
import paymentRoutes from "./routes/payment-routes/index.js";
import userRoute from "./routes/user-routes/index.js";
import reviewRoutes from "./routes/review-routes/index.js";
import { stripeWebhook } from "./controllers/payment-controller/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

//database connection
connectDB();

//middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Stripe webhook MUST be before express.json() - needs raw body
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "50mb" }));

//routes
app.use("/api/auth", authRoute);
app.use("/api/media", mediaRoutes);
app.use("/api/instructor/course", instructorRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoute);
app.use("/api/reviews", reviewRoutes);

//listening server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
