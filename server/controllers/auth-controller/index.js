import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "No data provided",
    });
  }
  const { userName, userEmail, password, role } = req.body;

  if (!userName || !userEmail || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User name or user email already exists",
    });
  }

  // Only allow "student" role during registration. Instructors must be created by admin.
  const safeRole = role === "instructor" ? "student" : role;

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    userName,
    userEmail,
    role: safeRole,
    password: hashPassword,
  });

  await newUser.save();

  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
  });
};

export const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  const checkUser = await User.findOne({ userEmail });

  if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
    },
  });
};

// Check auth status
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Forgot password - generate reset token
export const forgotPassword = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET + user.password,
      { expiresIn: "1h" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send via email. For now return the token for testing
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      data: { resetToken }, // Remove in production - for testing only
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Verify token
    try {
      jwt.verify(resetToken, process.env.JWT_SECRET + user.password);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Google OAuth login
export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    let user = await User.findOne({ userEmail: email });

    if (!user) {
      // Create new user
      const hashPassword = await bcrypt.hash(googleId, 10);
      user = await User.create({
        userName: name.toLowerCase().replace(/\s+/g, "_"),
        userEmail: email,
        password: hashPassword,
        role: "student",
        googleId,
        avatar: req.body.avatar || "",
      });
    } else if (!user.googleId) {
      // Link google account
      user.googleId = googleId;
      if (req.body.avatar) user.avatar = req.body.avatar;
      await user.save();
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};