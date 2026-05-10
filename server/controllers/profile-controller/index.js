import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import Enrollment from "../../models/Enrollment.js";
import LessonProgress from "../../models/LessonProgress.js";
import Course from "../../models/Course.js";
import Chapter from "../../models/Chapter.js";

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user statistics for profile
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get enrolled courses
    const enrollments = await Enrollment.find({ userId }).populate("courseId");
    const enrolledCourses = enrollments.filter(e => e.status === "Active").map(e => e.courseId);

    // Get completed lessons
    const completedLessons = await LessonProgress.countDocuments({
      userId,
      completed: true,
    });

    // Get total lessons across enrolled courses
    let totalLessons = 0;
    for (const course of enrolledCourses) {
      const chapters = await Chapter.find({ courseId: course._id });
      for (const chapter of chapters) {
        totalLessons += chapter.lessons.length;
      }
    }

    // Calculate hours learned (estimate based on completed lessons * 10 min average)
    const hoursLearned = Math.round((completedLessons * 10) / 60);

    // Calculate course completion percentage
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Get recent activity (last 5 completed lessons)
    const recentActivity = await LessonProgress.find({ userId, completed: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("courseId", "title");

    // Calculate achievements based on progress
    const achievements = [];
    if (enrolledCourses.length >= 1) achievements.push({ id: "first-course", title: "First Course", description: "Enrolled in your first course", icon: "🎓", earned: true });
    if (completedLessons >= 5) achievements.push({ id: "five-lessons", title: "Quick Learner", description: "Completed 5 lessons", icon: "⚡", earned: true });
    if (completedLessons >= 20) achievements.push({ id: "twenty-lessons", title: "Dedicated Student", description: "Completed 20 lessons", icon: "📚", earned: true });
    if (completionRate >= 50) achievements.push({ id: "halfway", title: "Halfway There", description: "50% course completion", icon: "🏁", earned: true });
    if (enrolledCourses.length >= 3) achievements.push({ id: "multi-course", title: "Multi-Course Master", description: "Enrolled in 3+ courses", icon: "🚀", earned: true });

    const stats = {
      totalCourses: enrolledCourses.length,
      completedLessons,
      totalLessons,
      hoursLearned,
      completionRate,
      achievements,
      recentActivity: recentActivity.map(a => ({
        id: a._id,
        courseTitle: a.courseId?.title || "Unknown Course",
        completedAt: a.updatedAt,
      })),
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "userName",
      "avatar",
      "bio",
      "phone",
      "title",
      "website",
      "socialLinks",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.userName) {
      const existing = await User.findOne({
        userName: updates.userName,
        _id: { $ne: req.user._id },
      });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Username is already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};