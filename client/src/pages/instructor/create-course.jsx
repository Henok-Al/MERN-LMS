import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Loader2,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  PlusCircle,
  X,
  Check,
  BookOpen,
  Video,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InstructorSidebar from "@/components/instructor-sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "@/lib/api";
import { FileUploader } from "@/components/ui/file-uploader";
import RichTextEditor from "@/components/ui/rich-text-editor";

const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  subtitle: z.string().optional(),
  smallDescription: z.string().max(300, "Must be under 300 characters").optional(),
  description: z.string().optional(),
  category: z.string().default("General"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  primaryLanguage: z.string().default("English"),
  pricing: z.coerce.number().min(0, "Price must be 0 or more"),
  duration: z.coerce.number().min(0, "Duration must be 0 or more"),
  image: z.string().optional(),
  welcomeMessage: z.string().optional(),
  objectives: z.string().optional(),
});

// Sortable Chapter Item (with nested lesson sorting)
function SortableChapter({
  chapter,
  chIdx,
  onDelete,
  onAddLesson,
  onDeleteLesson,
  handleLessonDragEnd,
  newLesson,
  setNewLesson,
  inputClass,
  lessons,
  sensors,
  onUploadVideo,
  uploadingVideoId,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Chapter {chIdx + 1}
          </span>
          <span className="font-semibold">{chapter.title}</span>
          <span className="text-xs text-muted-foreground">
            ({lessons?.length || 0} lessons)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(chapter._id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Lessons with Drag and Drop */}
      {lessons && lessons.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleLessonDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {lessons.map((lesson, lIdx) => (
                <SortableLesson
                  key={lesson._id}
                  lesson={lesson}
                  lIdx={lIdx}
                  chapterId={chapter._id}
                  onDelete={onDeleteLesson}
                  onUploadVideo={onUploadVideo}
                  uploadingVideoId={uploadingVideoId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Lesson */}
      {newLesson.chapterId === chapter._id ? (
        <div className="p-4 pl-8 bg-muted/20 space-y-3 border-t">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Lesson Title *</label>
            <input
              value={newLesson.title}
              onChange={(e) =>
                setNewLesson((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Introduction to React"
              className={inputClass}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input
              value={newLesson.description}
              onChange={(e) =>
                setNewLesson((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of this lesson"
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Duration</label>
              <input
                value={newLesson.duration}
                onChange={(e) =>
                  setNewLesson((prev) => ({ ...prev, duration: e.target.value }))
                }
                type="number"
                placeholder="Minutes"
                className={inputClass}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Video URL (optional)</label>
              <input
                value={newLesson.videoUrl}
                onChange={(e) =>
                  setNewLesson((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
                placeholder="Paste a video URL or leave empty to upload later"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => onAddLesson(chapter._id)}>
              <Check className="h-4 w-4 mr-1" />
              Add Lesson
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
            setNewLesson((prev) => ({ ...prev, chapterId: chapter._id }))
          }
          className="w-full flex items-center gap-2 px-4 py-2 pl-8 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t"
        >
          <PlusCircle className="h-4 w-4" />
          Add Lesson
        </button>
      )}
    </div>
  );
}

// Sortable Lesson Item
function SortableLesson({ lesson, lIdx, chapterId, onDelete, onUploadVideo, uploadingVideoId }) {
  const [dragOver, setDragOver] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasVideo = !!lesson.videoUrl;
  const isUploading = uploadingVideoId === lesson._id;

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Only MP4, WebM, and MOV are allowed.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 500 MB.");
      return;
    }
    onUploadVideo(chapterId, lesson._id, file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleBrowseClick = (e) => {
    e.stopPropagation();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm,video/quicktime";
    input.onchange = (event) => {
      const file = event.target.files[0];
      handleFileSelect(file);
    };
    input.click();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-b last:border-b-0"
    >
      {/* Lesson Header */}
      <div className="flex items-center justify-between px-4 py-2 pl-8 group">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <GripVertical className="h-3 w-3" />
          </button>
          {hasVideo ? (
            <Video className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm truncate">
            {lIdx + 1}. {lesson.title}
          </span>
          {lesson.duration > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              ({lesson.duration}min)
            </span>
          )}
          {hasVideo && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium shrink-0">
              Video ✓
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chapterId, lesson._id);
          }}
          className="text-destructive hover:text-destructive h-7 w-7 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Always visible Video Upload Area */}
      <div className="px-4 pl-10 pb-3">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          className={`
            border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all
            ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20"}
            ${isUploading ? "pointer-events-none opacity-60" : ""}
            ${hasVideo ? "border-green-500/40 bg-green-50/30 dark:bg-green-950/20" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-3 py-1">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">Uploading video...</span>
            </div>
          ) : hasVideo ? (
            <div className="flex items-center justify-center gap-3 py-1">
              <Video className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium text-primary">Video attached</span>
              <span className="text-xs text-muted-foreground">(click to replace)</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-1">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Upload video</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                MP4, WebM, MOV up to 500MB
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateCoursePage() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
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
    },
  });

  const [chapters, setChapters] = useState([]);
  const [uploadingVideoId, setUploadingVideoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newLesson, setNewLesson] = useState({
    chapterId: "",
    title: "",
    description: "",
    duration: 0,
    videoUrl: "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [courseCreated, setCourseCreated] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    ) {
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
            reset({
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
          toast.error("Failed to load course data");
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [isEditing, isAuthenticated, id, reset]);

  const onSave = async (data) => {
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/courses/${id}`, data);
        toast.success("Course updated successfully");
        navigate("/instructor/courses");
      } else {
        if (courseCreated) {
          // Update existing course (basic info after initial creation)
          await api.put(`/courses/${createdCourseId}`, data);
          toast.success("Changes saved successfully");
        } else {
          // Create course and switch to curriculum tab
          const res = await api.post("/courses", data);
          const newCourse = res.data.data;
          setCreatedCourseId(newCourse._id);
          setCourseCreated(true);
          setActiveTab("curriculum");
          toast.success("Course created! Now add your curriculum.");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const addChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      const courseIdToUse = isEditing ? id : createdCourseId;
      const res = await api.post("/courses/chapters", {
        courseId: courseIdToUse,
        title: newChapterTitle,
      });
      setChapters((prev) => [...prev, res.data.data]);
      setNewChapterTitle("");
      toast.success("Chapter added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add chapter");
    }
  };

  const deleteChapter = async (chapterId) => {
    try {
      await api.delete(`/courses/chapters/${chapterId}`);
      setChapters((prev) => prev.filter((ch) => ch._id !== chapterId));
      toast.success("Chapter deleted");
    } catch {
      toast.error("Failed to delete chapter");
    }
  };

  // Handle tab change - allow switching to curriculum only after course is created (in create mode)
  const handleTabChange = (tab) => {
    if (isEditing) {
      setActiveTab(tab);
      return;
    }
    // In create mode, can only switch to curriculum after course is created
    if (tab === "curriculum" && !courseCreated) {
      return; // Ignore - button should be disabled anyway
    }
    setActiveTab(tab);
  };

  const addLesson = async (chapterId) => {
    if (!newLesson.title.trim()) return;
    try {
      const res = await api.post(`/courses/chapters/${chapterId}/lessons`, {
        title: newLesson.title,
        description: newLesson.description,
        duration: Number(newLesson.duration),
        videoUrl: newLesson.videoUrl,
      });
      setChapters((prev) =>
        prev.map((ch) =>
          ch._id === chapterId
            ? { ...ch, lessons: [...(ch.lessons || []), res.data.data] }
            : ch
        )
      );
      setNewLesson({ chapterId: "", title: "", description: "", duration: 0, videoUrl: "" });
      toast.success("Lesson added");
    } catch {
      toast.error("Failed to add lesson");
    }
  };

  const uploadLessonVideo = async (chapterId, lessonId, file) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum file size is 500 MB" });
      return;
    }
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", { description: "Only MP4, WebM, and MOV files are allowed" });
      return;
    }
    setUploadingVideoId(lessonId);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const res = await api.post(
        `/courses/chapters/${chapterId}/lessons/${lessonId}/video`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.success) {
        // Update lesson in state with the new videoUrl
        setChapters((prev) =>
          prev.map((ch) =>
            ch._id === chapterId
              ? {
                  ...ch,
                  lessons: ch.lessons.map((l) =>
                    l._id === lessonId ? { ...l, videoUrl: res.data.data.videoUrl } : l
                  ),
                }
              : ch
          )
        );
        toast.success("Video uploaded to lesson");
      }
    } catch {
      toast.error("Failed to upload video");
    } finally {
      setUploadingVideoId(null);
    }
  };

  const deleteLesson = async (chapterId, lessonId) => {
    try {
      await api.delete(`/courses/chapters/${chapterId}/lessons/${lessonId}`);
      setChapters((prev) =>
        prev.map((ch) =>
          ch._id === chapterId
            ? { ...ch, lessons: ch.lessons.filter((l) => l._id !== lessonId) }
            : ch
        )
      );
      toast.success("Lesson deleted");
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  // Drag handlers
  const handleChapterDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        setChapters((prev) => {
          const oldIndex = prev.findIndex((ch) => ch._id === active.id);
          const newIndex = prev.findIndex((ch) => ch._id === over.id);
          const reordered = arrayMove(prev, oldIndex, newIndex);
          // Persist reorder
          const courseIdToUse = isEditing ? id : createdCourseId;
          api.put(`/courses/${courseIdToUse}/chapters/reorder`, {
            chapters: reordered.map((ch, idx) => ({
              id: ch._id,
              position: idx,
            })),
          }).catch(() => toast.error("Failed to save chapter order"));
          return reordered;
        });
      }
    },
    [id]
  );

  const handleLessonDragEnd = useCallback(
    (chapterId) => (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        setChapters((prev) =>
          prev.map((ch) => {
            if (ch._id !== chapterId) return ch;
            const lessons = ch.lessons || [];
            const oldIndex = lessons.findIndex((l) => l._id === active.id);
            const newIndex = lessons.findIndex((l) => l._id === over.id);
            const reordered = arrayMove(lessons, oldIndex, newIndex);
            // Persist reorder
            const courseIdToUse = isEditing ? id : createdCourseId;
              api
                .put(`/courses/${courseIdToUse}/chapters/${chapterId}/lessons/reorder`, {
                lessons: reordered.map((l, idx) => ({
                  id: l._id,
                  position: idx,
                })),
              })
              .catch(() => toast.error("Failed to save lesson order"));
            return { ...ch, lessons: reordered };
          })
        );
      }
    },
    []
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    return null;

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const textareaClass =
    "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const errorClass = "text-xs text-destructive mt-1";

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link
              to="/instructor/courses"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-semibold">
              {isEditing ? "Edit Course" : "Create New Course"}
            </h1>
          </div>
          <Button onClick={handleSubmit(onSave)} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Save Changes" : "Create Course"}
          </Button>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSave)} className="max-w-4xl mx-auto">
            {isEditing ? (
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto gap-0">
                  <TabsTrigger
                    value="basic"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold transition-colors"
                  >
                    Basic Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold transition-colors"
                  >
                    Curriculum
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-0 pt-2">
                  <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Course Title *
                        </label>
                        <input
                          {...register("title")}
                          placeholder="e.g., Complete React Course"
                          className={inputClass}
                        />
                        {errors.title && (
                          <p className={errorClass}>{errors.title.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Subtitle
                        </label>
                        <input
                          {...register("subtitle")}
                          placeholder="Short tagline for your course"
                          className={inputClass}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Short Description
                        </label>
                        <textarea
                          {...register("smallDescription")}
                          placeholder="Brief description (max 300 characters)"
                          className={textareaClass}
                          rows={2}
                        />
                        {errors.smallDescription && (
                          <p className={errorClass}>{errors.smallDescription.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Full Description
                        </label>
                        <RichTextEditor
                          value={watch("description")}
                          onChange={(html) => setValue("description", html)}
                          placeholder="Detailed description of your course..."
                          minHeight="250px"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Category
                        </label>
                        <select {...register("category")} className={inputClass}>
                          <option value="General">General</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile Development">Mobile Development</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Design">Design</option>
                          <option value="Business">Business</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Level
                        </label>
                        <select {...register("level")} className={inputClass}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Language
                        </label>
                        <input {...register("primaryLanguage")} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Duration (hours)
                        </label>
                        <input
                          {...register("duration")}
                          type="number"
                          className={inputClass}
                        />
                        {errors.duration && (
                          <p className={errorClass}>{errors.duration.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Price ($)
                        </label>
                        <input
                          {...register("pricing")}
                          type="number"
                          className={inputClass}
                        />
                        {errors.pricing && (
                          <p className={errorClass}>{errors.pricing.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Thumbnail Image
                        </label>
                        <FileUploader
                          value={watch("image")}
                          onChange={(url) => setValue("image", url)}
                          endpoint="/media/upload"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          What You'll Learn (one per line)
                        </label>
                        <textarea
                          {...register("objectives")}
                          placeholder="Build full-stack applications..."
                          className={textareaClass}
                          rows={4}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Welcome Message
                        </label>
                        <textarea
                          {...register("welcomeMessage")}
                          placeholder="Welcome to the course!"
                          className={textareaClass}
                          rows={3}
                        />
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-0 pt-2">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Course Curriculum</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag and drop chapters and lessons to reorder. Add lessons inside each chapter.
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Add Chapter */}
                    <div className="flex gap-2">
                      <input
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        placeholder="New chapter title..."
                        className={inputClass + " flex-1"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addChapter();
                          }
                        }}
                      />
                      <Button onClick={addChapter} size="sm" type="button">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Chapter
                      </Button>
                    </div>

                    {/* Chapters with Drag and Drop */}
                    {chapters.length === 0 ? (
                      <div className="border-2 border-dashed rounded-xl p-8 text-center">
                        <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                        <h3 className="font-semibold mb-1">No chapters yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Add your first chapter to start building your course structure.
                        </p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleChapterDragEnd}
                      >
                        <SortableContext
                          items={chapters.map((ch) => ch._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {chapters.map((chapter, chIdx) => (
                              <SortableChapter
                                key={chapter._id}
                                chapter={chapter}
                                chIdx={chIdx}
                                onDelete={deleteChapter}
                                onAddLesson={addLesson}
                                onDeleteLesson={deleteLesson}
                                handleLessonDragEnd={handleLessonDragEnd(chapter._id)}
                                newLesson={newLesson}
                                setNewLesson={setNewLesson}
                                inputClass={inputClass}
                                lessons={chapter.lessons}
                                sensors={sensors}
                                onUploadVideo={uploadLessonVideo}
                                uploadingVideoId={uploadingVideoId}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </section>
                </TabsContent>
              </Tabs>
            ) : (
              /* Create mode - using tabs */
              <Tabs defaultValue="basic" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto gap-0">
                  <TabsTrigger
                    value="basic"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold transition-colors"
                  >
                    Basic Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold transition-colors"
                    disabled={!courseCreated}
                  >
                    Course Curriculum
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-0 pt-2">
                  <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Course Title *
                        </label>
                        <input
                          {...register("title")}
                          placeholder="e.g., Complete React Course"
                          className={inputClass}
                        />
                        {errors.title && (
                          <p className={errorClass}>{errors.title.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Subtitle
                        </label>
                        <input
                          {...register("subtitle")}
                          placeholder="Short tagline for your course"
                          className={inputClass}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Short Description
                        </label>
                        <textarea
                          {...register("smallDescription")}
                          placeholder="Brief description (max 300 characters)"
                          className={textareaClass}
                          rows={2}
                        />
                        {errors.smallDescription && (
                          <p className={errorClass}>{errors.smallDescription.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Full Description
                        </label>
                        <RichTextEditor
                          value={watch("description")}
                          onChange={(html) => setValue("description", html)}
                          placeholder="Detailed description of your course..."
                          minHeight="250px"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Category
                        </label>
                        <select {...register("category")} className={inputClass}>
                          <option value="General">General</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile Development">Mobile Development</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Design">Design</option>
                          <option value="Business">Business</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Level
                        </label>
                        <select {...register("level")} className={inputClass}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Language
                        </label>
                        <input {...register("primaryLanguage")} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Duration (hours)
                        </label>
                        <input
                          {...register("duration")}
                          type="number"
                          className={inputClass}
                        />
                        {errors.duration && (
                          <p className={errorClass}>{errors.duration.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Price ($)
                        </label>
                        <input
                          {...register("pricing")}
                          type="number"
                          className={inputClass}
                        />
                        {errors.pricing && (
                          <p className={errorClass}>{errors.pricing.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Thumbnail Image
                        </label>
                        <FileUploader
                          value={watch("image")}
                          onChange={(url) => setValue("image", url)}
                          endpoint="/media/upload"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          What You'll Learn (one per line)
                        </label>
                        <textarea
                          {...register("objectives")}
                          placeholder="Build full-stack applications..."
                          className={textareaClass}
                          rows={4}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium leading-none mb-2 block">
                          Welcome Message
                        </label>
                        <textarea
                          {...register("welcomeMessage")}
                          placeholder="Welcome to the course!"
                          className={textareaClass}
                          rows={3}
                        />
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-0 pt-2">
                  {!courseCreated ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Creating course...</p>
                    </div>
                  ) : (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">Course Curriculum</h2>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag and drop chapters and lessons to reorder. Add lessons inside each chapter.
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Add Chapter */}
                      <div className="flex gap-2">
                        <input
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          placeholder="New chapter title..."
                          className={inputClass + ' flex-1'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addChapter();
                            }
                          }}
                        />
                        <Button onClick={addChapter} size="sm" type="button">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Chapter
                        </Button>
                      </div>

                      {/* Chapters with Drag and Drop */}
                      {chapters.length === 0 ? (
                        <div className="border-2 border-dashed rounded-xl p-8 text-center">
                          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                          <h3 className="font-semibold mb-1">No chapters yet</h3>
                          <p className="text-sm text-muted-foreground">
                            Add your first chapter to start building your course structure.
                          </p>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleChapterDragEnd}
                        >
                          <SortableContext
                            items={chapters.map((ch) => ch._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-3">
                              {chapters.map((chapter, chIdx) => (
                                <SortableChapter
                                  key={chapter._id}
                                  chapter={chapter}
                                  chIdx={chIdx}
                                  onDelete={deleteChapter}
                                  onAddLesson={addLesson}
                                  onDeleteLesson={deleteLesson}
                                  handleLessonDragEnd={handleLessonDragEnd(chapter._id)}
                                  newLesson={newLesson}
                                  setNewLesson={setNewLesson}
                                  inputClass={inputClass}
                                  lessons={chapter.lessons}
                                  sensors={sensors}
                                  onUploadVideo={uploadLessonVideo}
                                  uploadingVideoId={uploadingVideoId}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </section>
                  )}
                </TabsContent>

              </Tabs>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4 pb-8">
              <Button type="submit" disabled={saving} size="lg">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Save Changes" : "Create Course"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/instructor/courses")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}