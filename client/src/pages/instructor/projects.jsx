import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Loader2,
  FolderKanban,
  Plus,
  Calendar,
  Clock,
  Users,
  Trash2,
  Edit,
  Eye,
  Search,
  X,
  GraduationCap,
  Play,
  Pause,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import InstructorSidebar from "@/components/instructor-sidebar";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-700", icon: Pause },
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: Play },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: Lock },
};

const TYPE_CONFIG = {
  individual: { label: "Individual", color: "bg-blue-100 text-blue-700" },
  group: { label: "Group", color: "bg-purple-100 text-purple-700" },
};

export default function InstructorProjects() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    courseId: "",
    type: "individual",
    maxScore: 100,
    dueDate: "",
    status: "draft",
  });

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    ) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      const [projectsRes, coursesRes] = await Promise.all([
        api.get("/projects"),
        api.get("/courses/my-courses"),
      ]);
      setProjects(projectsRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      courseId: "",
      type: "individual",
      maxScore: 100,
      dueDate: "",
      status: "draft",
    });
    setEditProject(null);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      instructions: project.instructions || "",
      courseId: project.courseId?._id || project.courseId || "",
      type: project.type || "individual",
      maxScore: project.maxScore || 100,
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : "",
      status: project.status || "draft",
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        courseId: formData.courseId || null,
        dueDate: formData.dueDate || null,
      };

      if (editProject) {
        const res = await api.put(`/projects/${editProject._id}`, payload);
        setProjects((prev) =>
          prev.map((p) => (p._id === editProject._id ? res.data.data : p))
        );
        toast.success("Project updated");
      } else {
        const res = await api.post("/projects", payload);
        setProjects((prev) => [res.data.data, ...prev]);
        toast.success("Project created");
      }
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      toast.success("Project deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete project");
    }
  };

  const handleStatusToggle = async (project) => {
    const nextStatus =
      project.status === "draft"
        ? "active"
        : project.status === "active"
        ? "closed"
        : "draft";
    try {
      const res = await api.put(`/projects/${project._id}`, {
        status: nextStatus,
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? res.data.data : p))
      );
      toast.success(`Project marked as ${nextStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const textareaClass =
    "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelClass = "text-sm font-medium leading-none mb-2 block";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    return null;

  const ProjectForm = () => (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Project Title *</label>
        <input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Build a REST API"
          className={inputClass}
          autoFocus
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of the project"
          className={textareaClass}
          rows={2}
        />
      </div>
      <div>
        <label className={labelClass}>Instructions</label>
        <textarea
          value={formData.instructions}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, instructions: e.target.value }))
          }
          placeholder="Detailed instructions for students"
          className={textareaClass}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Linked Course</label>
          <select
            value={formData.courseId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, courseId: e.target.value }))
            }
            className={inputClass}
          >
            <option value="">None (standalone)</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className={inputClass}
          >
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Max Score</label>
          <input
            type="number"
            value={formData.maxScore}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxScore: Number(e.target.value),
              }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setCreateOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : editProject ? (
            <Edit className="h-4 w-4 mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {editProject ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar
          title={`Projects (${projects.length})`}
          rightContent={
            <Dialog
              open={createOpen || !!editProject}
              onOpenChange={(open) => {
                if (!open) resetForm();
                setCreateOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editProject ? "Edit Project" : "Create Project"}
                  </DialogTitle>
                  <DialogDescription>
                    {editProject
                      ? "Update project details and settings."
                      : "Create a new project for your students."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <ProjectForm />
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search */}
              {projects.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className={inputClass + " pl-10"}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Project List */}
              {projects.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl p-16 text-center">
                  <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h2 className="text-xl font-bold mb-2">No projects yet</h2>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create projects for your students and track their submissions
                  </p>
                  <Button
                    size="lg"
                    onClick={() => {
                      resetForm();
                      setCreateOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl p-16 text-center">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h2 className="text-xl font-bold mb-2">No results</h2>
                  <p className="text-muted-foreground">
                    No projects match "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map((project) => {
                    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
                    const typeCfg = TYPE_CONFIG[project.type] || TYPE_CONFIG.individual;
                    const StatusIcon = statusCfg.icon;

                    return (
                      <div
                        key={project._id}
                        className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">
                                {project.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}
                              >
                                {statusCfg.label}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg.color}`}
                              >
                                {typeCfg.label}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {project.courseId && (
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {project.courseId.title}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {project.dueDate
                                  ? new Date(project.dueDate).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : "No deadline"}
                              </span>
                              <span>
                                Max: {project.maxScore} pts
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(project)}
                              title={`Change status (currently ${project.status})`}
                            >
                              <StatusIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                openEdit(project);
                                setCreateOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(project._id, project.title)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stats */}
              {projects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4">
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {projects.filter((p) => p.status === "active").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {projects.filter((p) => p.status === "draft").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Closed</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {projects.filter((p) => p.status === "closed").length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}