import Review from "../../models/Review.js";
import Enrollment from "../../models/Enrollment.js";

// Get reviews for a course
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ courseId })
      .populate("userId", "userName avatar")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: {
          total: reviews.length,
          average: Math.round(averageRating * 10) / 10,
          distribution,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a review (must be enrolled)
export const addReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId,
      status: "Active",
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ success: false, message: "You must be enrolled to review this course" });
    }

    // Check existing review
    const existing = await Review.findOne({
      userId: req.user._id,
      courseId,
    });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || "";
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    const review = await Review.create({
      userId: req.user._id,
      courseId,
      rating,
      comment,
    });
    await review.populate("userId", "userName avatar");

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    if (review.userId.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};