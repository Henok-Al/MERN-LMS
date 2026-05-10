import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "student", enum: ["student", "instructor", "admin"] },
    status: { type: String, default: "active", enum: ["active", "suspended", "banned"] },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    phone: { type: String, default: "" },
    title: { type: String, default: "" },
    website: { type: String, default: "" },
    googleId: { type: String, default: "" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    socialLinks: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

UserSchema.index({ userEmail: 1 }, { unique: true });
UserSchema.index({ userName: 1 }, { unique: true });

const User = mongoose.model("User", UserSchema);

export default User;