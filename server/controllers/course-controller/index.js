import Course from "../../models/Course.js";
import Chapter from "../../models/Chapter.js";
import Enrollment from "../../models/Enrollment.js";
import LessonProgress from "../../models/LessonProgress.js";
import slugify from "slugify";

// Get all published courses (public)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "Published" }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single course by slug with chapters
export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const chapters = await Chapter.find({ courseId: course._id }).sort({
      position: 1,
    });

    res.status(200).json({ success: true, data: { course, chapters } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course sidebar data (for dashboard learning view)
export const getCourseSidebarData = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const chapters = await Chapter.find({ courseId }).sort({ position: 1 });

    // Get user's lesson progress
    const progress = await LessonProgress.find({
      userId: req.user.id,
      courseId,
    });

    res.status(200).json({
      success: true,
      data: {
        course,
        chapters: chapters.map((ch) => ({
          ...ch.toObject(),
          lessons: ch.lessons.map((lesson) => ({
            ...lesson.toObject(),
            progress: progress.find(
              (p) => p.lessonId === lesson._id.toString()
            ),
          })),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get enrolled courses for a student
export const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.user.id,
      status: "Active",
    }).populate("courseId");

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.courseId;
        const chapters = await Chapter.find({ courseId: course._id });
        const totalLessons = chapters.reduce(
          (acc, ch) => acc + ch.lessons.length,
          0
        );
        const completedLessons = await LessonProgress.countDocuments({
          userId: req.user.id,
          courseId: course._id,
          completed: true,
        });

        return {
          Course: course,
          enrollment,
          progress:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
        };
      })
    );

    res.status(200).json({ success: true, data: coursesWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enroll in a course
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId,
      amount: course.pricing,
      status: "Active",
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark lesson as complete/incomplete
export const updateLessonProgress = async (req, res) => {
  try {
    const { lessonId, courseId, completed } = req.body;

    const existing = await LessonProgress.findOne({
      userId: req.user.id,
      lessonId,
    });

    if (existing) {
      existing.completed = completed;
      await existing.save();
    } else {
      await LessonProgress.create({
        userId: req.user.id,
        lessonId,
        courseId,
        completed,
      });
    }

    res.status(200).json({ success: true, message: "Progress updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Instructor: Create course
export const createCourse = async (req, res) => {
  try {
    const { title } = req.body;
    let slug = slugify(title, { lower: true, strict: true });

    // Ensure unique slug
    let existingCourse = await Course.findOne({ slug });
    let counter = 1;
    while (existingCourse) {
      slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
      existingCourse = await Course.findOne({ slug });
      counter++;
    }

    const course = await Course.create({
      ...req.body,
      slug,
      instructorId: req.user.id,
      instructorName: req.user.userName,
      status: "Draft",
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Instructor: Update course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Instructor: Get my courses
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course by ID (for editing)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Instructor: Delete course
export const deleteCourse = async (req, res) => {
  try {
    await Chapter.deleteMany({ courseId: req.params.id });
    await Enrollment.deleteMany({ courseId: req.params.id });
    await LessonProgress.deleteMany({ courseId: req.params.id });
    await Course.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};