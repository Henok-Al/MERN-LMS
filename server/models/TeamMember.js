import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["co-instructor", "assistant", "editor"],
      default: "co-instructor",
    },
    status: {
      type: String,
      enum: ["active", "pending", "rejected"],
      default: "active",
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate team members
TeamMemberSchema.index({ ownerId: 1, memberId: 1 }, { unique: true });

export default mongoose.model("TeamMember", TeamMemberSchema);