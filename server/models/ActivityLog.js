import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "PASSWORD_RESET",
        "PROFILE_UPDATE",
        "COURSE_ENROLL",
        "COURSE_COMPLETE",
        "LESSON_COMPLETE",
        "COURSE_CREATE",
        "COURSE_UPDATE",
        "COURSE_DELETE",
        "USER_CREATE",
        "USER_UPDATE",
        "USER_DELETE",
        "USER_ROLE_CHANGE",
        "USER_SUSPEND",
        "USER_ACTIVATE",
      ],
    },
    description: { type: String, required: true },
    metadata: {
      ipAddress: String,
      userAgent: String,
      courseId: mongoose.Schema.Types.ObjectId,
      targetUserId: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", ActivityLogSchema);
