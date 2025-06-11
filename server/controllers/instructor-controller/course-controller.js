import Course from "../../models/Course.js";

export const addNewCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const newlyCreatedCourse = new Course(courseData);
    const saveCourse = await newlyCreatedCourse.save();

    if (saveCourse) {
      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: saveCourse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courseList = await Course.find({});

    res.status(200).json({
      success: true,
      data: courseList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

export const getCourseDetailsByID = async (req, res) => {
  try {
  } catch (e) {
    console.log(e);
  }
};

export const updateCourseByID = async (req, res) => {
  try {
  } catch (e) {
    console.log(e);
  }
};
