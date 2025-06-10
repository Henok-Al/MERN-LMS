import express from "express";
import { addNewCourse } from "../../controllers/instructor-controller/course-controller.js";

const router = express.Router();

router.post("/add", addNewCourse);
// router.get("/get", getAllCourses);
// router.get("/get/details/:id", getCourseDetailsByID);
// router.put("/update/:id", updateCourseByID);

export default router;
