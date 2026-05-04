import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./database/db.js";
import authRoute from "./routes/auth-routes/index.js";
import instructorRoute from "./routes/instructor-routes/course-route.js";
import mediaRoutes from "./routes/instructor-routes/media-routes.js";
import courseRoutes from "./routes/course-routes/index.js";

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
app.use(express.json({ limit: "50mb" }));

//routes
app.use("/api/auth", authRoute);
app.use("/api/media", mediaRoutes);
app.use("/api/instructor/course", instructorRoute);
app.use("/api/courses", courseRoutes);

//listening server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
