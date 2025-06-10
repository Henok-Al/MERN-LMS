import "dotenv/config";
import express from "express";
import connectDB from "./database/db.js";
import authRoute from "./routes/instructor-routes/course-route.js";
import instructorRoute from "./routes/instructor-routes/course-route.js";

const app = express();
const PORT = process.env.PORT || 5000;

//database connection
connectDB();

app.use(express.json());
app.use("/auth", authRoute);
app.use("/instructor/course", instructorRoute);

//listening server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
