import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";

/**
 * Register a new user
 * @param {Object} req - Express request object containing user data
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating success or failure
 */


/**
 * Authenticate user and generate access token
 * @param {Object} req - Express request object containing login credentials
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token and user data or error
 */
export const loginUser = async (req, res) => {
  // Extract login credentials from request body
  const { userEmail, password } = req.body;

  // Find user by email in database
  const checkUser = await User.findOne({ userEmail });

  // Check if:
  // 1. User doesn't exist OR
  // 2. Password doesn't match (using bcrypt.compare)
  if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
    // Return 401 Unauthorized for invalid credentials
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Create JWT token containing user information
  const accessToken = jwt.sign(
    {
      _id: checkUser._id, // User ID from MongoDB
      userName: checkUser.userName, // Username
      userEmail: checkUser.userEmail, // Email
      role: checkUser.role, // User role
    },
    "JWT_SECRET", // Secret key for signing (should be in .env)
    { expiresIn: "120m" } // Token expires in 120 minutes (2 hours)
  );

  // Return success response with:
  // 1. The access token
  // 2. Basic user information (without sensitive data like password)
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken, // The JWT token to be used for authenticated requests
      user: {
        // User details for the client
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
    },
  });
};
