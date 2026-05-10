import Project from "../../models/Project.js";
import Course from "../../models/Course.js";

// Get all projects for the logged-in instructor
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ instructorId: req.user._id })
      .populate("courseId", "title slug")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      instructorId: req.user._id,
    }).populate("courseId", "title slug");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create project
export const createProject = async (req, res) => {
  try {
    const { title, description, instructions, courseId, type, maxScore, dueDate, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
    }

    const project = await Project.create({
      instructorId: req.user._id,
      title,
      description: description || "",
      instructions: instructions || "",
      courseId: courseId || null,
      type: type || "individual",
      maxScore: maxScore || 100,
      dueDate: dueDate || null,
      status: status || "draft",
    });

    const populated = await Project.findById(project._id).populate("courseId", "title slug");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, instructorId: req.user._id },
      req.body,
      { new: true }
    ).populate("courseId", "title slug");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      instructorId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};