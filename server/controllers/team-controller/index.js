import User from "../../models/User.js";
import TeamMember from "../../models/TeamMember.js";

// Get team members for the logged-in instructor
export const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ ownerId: req.user._id })
      .populate("memberId", "userName userEmail role")
      .sort({ createdAt: -1 });

    const formatted = members.map((m) => ({
      _id: m._id,
      userId: m.memberId._id,
      name: m.memberId.userName,
      email: m.memberId.userEmail,
      role: m.role,
      status: m.status,
      invitedAt: m.invitedAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Invite a team member by email
export const inviteTeamMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Find the user to invite
    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    // Cannot add yourself
    if (user._id.toString() === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself to the team",
      });
    }

    // Check if already a team member
    const existing = await TeamMember.findOne({
      ownerId: req.user._id,
      memberId: user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This user is already a team member",
      });
    }

    const member = await TeamMember.create({
      ownerId: req.user._id,
      memberId: user._id,
      role: role || "co-instructor",
      status: "active",
    });

    const populated = await TeamMember.findById(member._id).populate(
      "memberId",
      "userName userEmail role"
    );

    res.status(201).json({
      success: true,
      data: {
        _id: populated._id,
        userId: populated.memberId._id,
        name: populated.memberId.userName,
        email: populated.memberId.userEmail,
        role: populated.role,
        status: populated.status,
        invitedAt: populated.invitedAt,
      },
      message: "Team member invited successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update team member role
export const updateTeamMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["co-instructor", "assistant", "editor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be co-instructor, assistant, or editor",
      });
    }

    const member = await TeamMember.findOneAndUpdate(
      { _id: id, ownerId: req.user._id },
      { role },
      { new: true }
    ).populate("memberId", "userName userEmail role");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: member._id,
        userId: member.memberId._id,
        name: member.memberId.userName,
        email: member.memberId.userEmail,
        role: member.role,
        status: member.status,
        invitedAt: member.invitedAt,
      },
      message: "Team member role updated",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await TeamMember.findOneAndDelete({
      _id: id,
      ownerId: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};