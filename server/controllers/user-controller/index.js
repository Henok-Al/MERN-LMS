import User from "../../models/User.js";
import Course from "../../models/Course.js";
import Enrollment from "../../models/Enrollment.js";
import Chapter from "../../models/Chapter.js";
import ActivityLog from "../../models/ActivityLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    
    // Get enrollment counts for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const enrollmentCount = await Enrollment.countDocuments({ userId: user._id });
      return {
        ...user.toObject(),
        enrolledCourses: enrollmentCount
      };
    }));
    
    res.json({
      success: true,
      data: usersWithStats,
      count: usersWithStats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const enrollmentCount = await Enrollment.countDocuments({ userId: user._id });
    const enrolledCourses = await Enrollment.find({ userId: user._id }).populate('courseId', 'title slug');
    
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        enrolledCourses: enrollmentCount,
        courses: enrolledCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'instructor', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be admin, instructor, or student"
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      message: "User role updated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = async (req, res) => {
  try {
    const { userName, userEmail, role } = req.body;
    
    const updateData = {};
    if (userName) updateData.userName = userName;
    if (userEmail) updateData.userEmail = userEmail;
    if (role) updateData.role = role;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user"
        });
      }
    }
    
    // Delete user's courses if they are an instructor
    if (user.role === 'instructor') {
      await Course.deleteMany({ instructorId: user._id });
    }
    
    // Delete user's enrollments and progress
    await Enrollment.deleteMany({ userId: user._id });
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// @desc    Get 30-day enrollment stats for charts
// @route   GET /api/users/admin/enrollment-stats
// @access  Admin
export const getEnrollmentStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollments = await Enrollment.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 });

    // Build 30-day array
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last30Days.push({
        date: date.toISOString().split("T")[0],
        enrollments: 0,
      });
    }

    enrollments.forEach((enrollment) => {
      const enrollmentDate = enrollment.createdAt.toISOString().split("T")[0];
      const dayIndex = last30Days.findIndex((day) => day.date === enrollmentDate);
      if (dayIndex !== -1) {
        last30Days[dayIndex].enrollments++;
      }
    });

    res.json({
      success: true,
      data: last30Days,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment stats",
      error: error.message,
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'Published' });
    const draftCourses = await Course.countDocuments({ status: 'Draft' });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalLessons = await Chapter.aggregate([
      { $project: { lessonCount: { $size: "$lessons" } } },
      { $group: { _id: null, total: { $sum: "$lessonCount" } } },
    ]);
    
    // Calculate total revenue
    const enrollments = await Enrollment.find().populate('courseId');
    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.courseId?.pricing || 0);
    }, 0);
    
    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'userName userEmail')
      .populate('courseId', 'title');
    
    // Get popular courses
    const popularCourses = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          title: 1,
          slug: 1,
          pricing: 1,
          status: 1,
          enrollmentCount: { $size: '$enrollments' }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
        data: {
        users: {
          total: totalUsers,
          instructors: totalInstructors,
          students: totalStudents
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          drafts: draftCourses,
          totalLessons: totalLessons.length > 0 ? totalLessons[0].total : 0
        },
        enrollments: {
          total: totalEnrollments,
          revenue: totalRevenue
        },
        recentEnrollments,
        popularCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error.message
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Admin
export const createUser = async (req, res) => {
  try {
    const { userName, userEmail, password, role } = req.body;

    if (!userName || !userEmail || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ userEmail }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User name or email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userName,
      userEmail,
      password: hashedPassword,
      role: role.toLowerCase(),
      status: "active",
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "USER_CREATE",
      description: `Created new user: ${userName} (${role})`,
      metadata: { targetUserId: newUser._id },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// @desc    Reset user password (Admin only)
// @route   POST /api/users/:id/reset-password
// @access  Admin
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "PASSWORD_RESET",
      description: `Reset password for user: ${user.userName}`,
      metadata: { targetUserId: user._id },
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// @desc    Suspend user (Admin only)
// @route   PUT /api/users/:id/suspend
// @access  Admin
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent suspending the last admin
    if (user.role === "admin" && user.status === "active") {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        status: "active",
      });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot suspend the last active admin",
        });
      }
    }

    user.status = "suspended";
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "USER_SUSPEND",
      description: `Suspended user: ${user.userName}`,
      metadata: { targetUserId: user._id },
    });

    res.json({
      success: true,
      message: "User suspended successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to suspend user",
      error: error.message,
    });
  }
};

// @desc    Activate user (Admin only)
// @route   PUT /api/users/:id/activate
// @access  Admin
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = "active";
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: "USER_ACTIVATE",
      description: `Activated user: ${user.userName}`,
      metadata: { targetUserId: user._id },
    });

    res.json({
      success: true,
      message: "User activated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to activate user",
      error: error.message,
    });
  }
};

// @desc    Get user activity logs (Admin only)
// @route   GET /api/users/:id/activity
// @access  Admin
export const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const logs = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("userId", "userName userEmail");

    const total = await ActivityLog.countDocuments({ userId });

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(limit) * parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/users/activity/all
// @access  Admin
export const getAllActivityLogs = async (req, res) => {
  try {
    const { limit = 50, skip = 0, action } = req.query;

    const filter = {};
    if (action) {
      filter.action = action.toUpperCase();
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("userId", "userName userEmail")
      .populate("metadata.targetUserId", "userName userEmail");

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
};
