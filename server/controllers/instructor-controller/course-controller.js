import Course from "../../models/Course.js";
import Chapter from "../../models/Chapter.js";
import Enrollment from "../../models/Enrollment.js";
import LessonProgress from "../../models/LessonProgress.js";

// Get instructor dashboard stats
export const getInstructorStats = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user._id });
    const courseIds = courses.map((c) => c._id);

    const totalEnrollments = await Enrollment.countDocuments({
      courseId: { $in: courseIds },
      status: "Active",
    });

    const totalLessons = await Chapter.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $project: { lessonCount: { $size: "$lessons" } } },
      { $group: { _id: null, total: { $sum: "$lessonCount" } } },
    ]);

    // Calculate completion rate
    const totalProgress = await LessonProgress.countDocuments({
      courseId: { $in: courseIds },
    });
    const completedProgress = await LessonProgress.countDocuments({
      courseId: { $in: courseIds },
      completed: true,
    });
    const completionRate =
      totalProgress > 0
        ? Math.round((completedProgress / totalProgress) * 100)
        : 0;

    // Monthly enrollment data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnrollments = await Enrollment.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const enrollmentData = monthlyEnrollments.map((item) => ({
      month: monthNames[item._id.month - 1],
      enrollments: item.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCourses: courses.length,
          publishedCourses: courses.filter((c) => c.status === "Published").length,
          draftCourses: courses.filter((c) => c.status === "Draft").length,
          totalEnrollments,
          completionRate,
          totalLessons: totalLessons.length > 0 ? totalLessons[0].total : 0,
        },
        enrollmentData,
        coursePerformance: courses.map((c) => ({
          _id: c._id,
          title: c.title,
          slug: c.slug,
          status: c.status,
          pricing: c.pricing,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};