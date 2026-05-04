import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  Loader2,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  FileText,
  PlusCircle,
  X,
  Check,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function CreateCoursePage() {
  const { user, logout, isAuthenticated, isLoading } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    smallDescription: "",
    description: "",
    category: "General",
    level: "Beginner",
    primaryLanguage: "English",
    pricing: 0,
    duration: 0,
    image: "",
    welcomeMessage: "",
    objectives: "",
  });
  const [chapters, setChapters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newLesson, setNewLesson] = useState({ chapterId: "", title: "", description: "", duration: 0, videoUrl: "" });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "instructor")) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isEditing && isAuthenticated) {
      const fetchCourse = async () => {
        try {
          const [chaptersRes, courseRes] = await Promise.all([
            api.get(`/courses/${id}/chapters`),
            api.get(`/courses/${id}`),
          ]);
          if (courseRes.data.data) {
            const c = courseRes.data.data;
            setFormData({
              title: c.title || "",
              subtitle: c.subtitle || "",
              smallDescription: c.smallDescription || "",
              description: c.description || "",
              category: c.category || "General",
              level: c.level || "Beginner",
              primaryLanguage: c.primaryLanguage || "English",
              pricing: c.pricing || 0,
              duration: c.duration || 0,
              image: c.image || "",
              welcomeMessage: c.welcomeMessage || "",
              objectives: c.objectives || "",
            });
          }
          setChapters(chaptersRes.data.data || []);
        } catch {
          // silently fail
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [isEditing, isAuthenticated, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/courses/${id}`, formData);
      } else {
        await api.post("/courses", formData);
      }
      navigate("/instructor");
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const addChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      const res = await api.post("/courses/chapters", {
        courseId: id,
        title: newChapterTitle,
      });
      setChapters((prev) => [...prev, res.data.data]);
      setNewChapterTitle("");
    } catch {
      // silently fail
    }
  };

  const deleteChapter = async (chapterId) => {
    try {
      await api.delete(`/courses/chapters/${chapterId}`);
      setChapters((prev) => prev.filter((ch) => ch._id !== chapterId));
    } catch {
      // silently fail
    }
  };

  const addLesson = async (chapterId) => {
    if (!newLesson.title.trim()) return;
    try {
      const res = await api.post(
        `/courses/chapters/${chapterId}/lessons`,
        {
          title: newLesson.title,
          description: newLesson.description,
          duration: Number(newLesson.duration),
          videoUrl: newLesson.videoUrl,
        }
      );
      setChapters((prev) =>
        prev.map((ch) =>
          ch._id === chapterId
            ? { ...ch, lessons: [...(ch.lessons || []), res.data.data] }
            : ch
        )
      );
      setNewLesson({ chapterId: "", title: "", description: "", duration: 0, videoUrl: "" });
    } catch {
      // silently fail
    }
  };

  const deleteLesson = async (chapterId, lessonId) => {
    try {
      await api.delete(`/courses/chapters/${chapterId}/lessons/${lessonId}`);
      setChapters((prev) =>
        prev.map((ch) =>
          ch._id === chapterId
            ? {
                ...ch,
                lessons: ch.lessons.filter((l) => l._id !== lessonId),
              }
            : ch
        )
      );
    } catch {
      // silently fail
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "instructor") return null;

  const labelClass =
    "text-sm font-medium leading-none mb-2 block";
  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const textareaClass =
    "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card hidden lg:flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">Know Thyself</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/instructor"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Courses
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {isEditing ? "Edit Course" : "Create New Course"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Save Changes" : "Create Course"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Course Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Complete React Course"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Subtitle</label>
                  <input
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Short tagline for your course"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Short Description</label>
                  <textarea
                    name="smallDescription"
                    value={formData.smallDescription}
                    onChange={handleChange}
                    placeholder="Brief description (max 300 characters)"
                    className={textareaClass}
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed description of your course"
                    className={textareaClass}
                    rows={5}
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="General">General</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">
                      Mobile Development
                    </option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <input
                    name="primaryLanguage"
                    value={formData.primaryLanguage}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Duration (hours)</label>
                  <input
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price ($)</label>
                  <input
                    name="pricing"
                    type="number"
                    value={formData.pricing}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Thumbnail Image URL
                  </label>
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    What You'll Learn (one per line)
                  </label>
                  <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleChange}
                    placeholder="Build full-stack applications..."
                    className={textareaClass}
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Welcome Message</label>
                  <textarea
                    name="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={handleChange}
                    placeholder="Welcome to the course!"
                    className={textareaClass}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* Curriculum (only if editing) */}
            {isEditing && (
              <section className="space-y-4 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Course Curriculum
                  </h2>
                </div>

                {/* Add Chapter */}
                <div className="flex gap-2">
                  <input
                    value={newChapterTitle}
                    onChange={(e) =>
                      setNewChapterTitle(e.target.value)
                    }
                    placeholder="New chapter title..."
                    className={inputClass + " flex-1"}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChapter();
                      }
                    }}
                  />
                  <Button onClick={addChapter} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Chapter
                  </Button>
                </div>

                {/* Chapters List */}
                <div className="space-y-3">
                  {chapters.map((chapter, chIdx) => (
                    <div
                      key={chapter._id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Chapter {chIdx + 1}
                          </span>
                          <span className="font-semibold">
                            {chapter.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteChapter(chapter._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Lessons */}
                      <div className="divide-y">
                        {chapter.lessons?.map((lesson, lIdx) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between px-4 py-2 pl-8"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {lIdx + 1}. {lesson.title}
                              </span>
                              {lesson.duration > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({lesson.duration}min)
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteLesson(chapter._id, lesson._id)
                              }
                              className="text-destructive hover:text-destructive h-7 w-7 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {/* Add Lesson Form */}
                        {newLesson.chapterId === chapter._id ? (
                          <div className="p-4 pl-8 bg-muted/20 space-y-2">
                            <input
                              value={newLesson.title}
                              onChange={(e) =>
                                setNewLesson((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Lesson title"
                              className={inputClass}
                            />
                            <input
                              value={newLesson.description}
                              onChange={(e) =>
                                setNewLesson((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Description (optional)"
                              className={inputClass}
                            />
                            <div className="flex gap-2">
                              <input
                                value={newLesson.duration}
                                onChange={(e) =>
                                  setNewLesson((prev) => ({
                                    ...prev,
                                    duration: e.target.value,
                                  }))
                                }
                                type="number"
                                placeholder="Duration (min)"
                                className={inputClass + " w-40"}
                              />
                              <input
                                value={newLesson.videoUrl}
                                onChange={(e) =>
                                  setNewLesson((prev) => ({
                                    ...prev,
                                    videoUrl: e.target.value,
                                  }))
                                }
                                placeholder="Video URL (optional)"
                                className={inputClass + " flex-1"}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => addLesson(chapter._id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setNewLesson({
                                    chapterId: "",
                                    title: "",
                                    description: "",
                                    duration: 0,
                                    videoUrl: "",
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setNewLesson((prev) => ({
                                ...prev,
                                chapterId: chapter._id,
                              }))
                            }
                            className="w-full flex items-center gap-2 px-4 py-2 pl-8 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Lesson
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4 pb-8">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Save Changes" : "Create Course"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/instructor")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}