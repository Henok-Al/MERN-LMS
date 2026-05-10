import { useContext, useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  Loader2,
  ArrowLeft,
  Menu,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Home,
  BookOpen,
  PlayCircle,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Save,
  GripVertical,
  GripVerticalIcon,
  FileTextIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import api from "@/lib/api";
import slugify from "slugify";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { FileUploader } from "@/components/ui/file-uploader";
import { VideoUploader } from "@/components/ui/video-uploader";
import { LessonVideoUpload } from "./LessonVideoUpload";
import { cn } from "@/lib/utils";
import { Upload, CheckCircle2 } from "lucide-react";

function AdminSidebar() {
  return (
    <div className="w-64 border-r bg-sidebar flex-col shrink-0 hidden lg:flex">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-sidebar-foreground">Skillio Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="/admin/courses"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <FileText className="h-4 w-4" />
          Courses
        </Link>
        <Link
          to="/admin/courses/create"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Link>
        <div className="pt-4 pb-2">
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3">Navigation</p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          Student Dashboard
        </Link>
      </nav>
    </div>
  );
}

// ====== Delete Confirmation Dialogs ======
function DeleteConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmText = "Delete" }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ====== New Chapter Modal ======
function NewChapterModal({ courseId, onChapterCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/courses/chapters", { courseId, title: title.trim() });
      toast.success("Chapter created successfully");
      setTitle("");
      setOpen(false);
      onChapterCreated(res.data.data);
    } catch {
      toast.error("Failed to create chapter");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setTitle(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new chapter</DialogTitle>
          <DialogDescription>What would you like to name your chapter?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Chapter Title</Label>
            <Input
              placeholder="e.g. Introduction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating || !title.trim()}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Chapter
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== New Lesson Modal ======
function NewLessonModal({ chapterId, onLessonCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [freePreview, setFreePreview] = useState(false);
  const [duration, setDuration] = useState(0);
  const [creating, setCreating] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = useCallback(async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Only MP4, WebM, and MOV files are allowed",
      });
      return;
    }

    // Validate file size (500 MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 500 MB",
      });
      return;
    }

    setUploadingVideo(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      // First create the lesson without video
      const lessonRes = await api.post(`/courses/chapters/${chapterId}/lessons`, {
        title: title.trim() || "Untitled Lesson",
        description,
        freePreview,
        duration,
      });

      if (lessonRes.data.success) {
        const lessonId = lessonRes.data.data._id;
        
        // Then upload video
        const uploadRes = await api.post(
          `/courses/chapters/${chapterId}/lessons/${lessonId}/video`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (uploadRes.data.success) {
          toast.success("Video uploaded successfully");
          setVideoUrl(uploadRes.data.data.videoUrl);
          onLessonCreated(uploadRes.data.data);
          setOpen(false);
          // Reset form
          setTitle("");
          setVideoUrl("");
          setDescription("");
          setFreePreview(false);
          setDuration(0);
        }
      }
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error("Failed to upload video", {
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setUploadingVideo(false);
    }
  }, [chapterId, title, description, freePreview, duration, onLessonCreated]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      await handleVideoUpload(file);
    }
  }, [handleVideoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    disabled: uploadingVideo,
  });

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await api.post(`/courses/chapters/${chapterId}/lessons`, {
        title: title.trim(),
        description,
        videoUrl,
        freePreview,
        duration,
      });
      toast.success("Lesson created successfully");
      setTitle("");
      setVideoUrl("");
      setDescription("");
      setFreePreview(false);
      setDuration(0);
      setOpen(false);
      onLessonCreated(res.data.data);
    } catch {
      toast.error("Failed to create lesson");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setTitle(""); setVideoUrl(""); setDescription(""); setFreePreview(false); setDuration(0); } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Lesson
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Lesson</DialogTitle>
          <DialogDescription>Add a new lesson to this chapter</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Lesson Title *</Label>
            <Input
              placeholder="e.g. What is this course about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Video Upload (optional)</Label>
            <div
              {...getRootProps()}
              className={cn(
                "relative w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-6",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                uploadingVideo && "pointer-events-none opacity-60"
              )}
            >
              <input
                type="file"
                {...getInputProps()}
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                }}
              />
              {uploadingVideo ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading video...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isDragActive ? "Drop video here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, WebM, MOV up to 500 MB
                    </p>
                  </div>
                </>
              )}
            </div>
            {videoUrl && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <CheckCircle2 className="h-3 w-3" />
                Video uploaded successfully
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Brief description of this lesson"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2 flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freePreview}
                  onChange={(e) => setFreePreview(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Free Preview</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating || !title.trim()}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Create Lesson
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== Sortable Chapter ======
function SortableChapter({ chapter, courseId, onChapterDeleted, onLessonAdded, onLessonUpdated, onLessonDeleted, isDragging }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`border rounded-lg ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center"
          >
            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{chapter.title}</span>
          <Badge variant="secondary" className="text-xs ml-2">
            {chapter.lessons?.length || 0} lessons
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <NewLessonModal chapterId={chapter._id} onLessonCreated={(lesson) => onLessonAdded(chapter._id, lesson)} />
          <ChapterDeleteButton chapterId={chapter._id} courseId={courseId} onDeleted={() => onChapterDeleted(chapter._id)} />
        </div>
      </div>
      {expanded && (
        <div className="border-t">
          {chapter.lessons?.length > 0 ? (
            <div className="divide-y">
               {chapter.lessons.map((lesson) => (
                 <div key={lesson._id || lesson.id} className="flex items-center justify-between p-2 pl-8 hover:bg-accent/30 transition-colors">
                   <div className="flex items-center gap-3">
                     <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                     <div>
                       <span className="text-sm">{lesson.title}</span>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                         {lesson.duration > 0 && <span>{lesson.duration} min</span>}
                         {lesson.freePreview && (
                           <Badge variant="outline" className="text-[10px] px-1 py-0">Free</Badge>
                         )}
                         {lesson.videoUrl && (
                           <Badge variant="secondary" className="text-[10px] px-1 py-0">Video</Badge>
                         )}
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <LessonVideoUpload
                       chapterId={chapter._id}
                       lessonId={lesson._id || lesson.id}
                       currentVideoUrl={lesson.videoUrl}
                       onVideoUploaded={(updatedLesson) => {
                         onLessonUpdated(chapter._id, updatedLesson);
                       }}
                     />
                     <LessonDeleteButton chapterId={chapter._id} lessonId={lesson._id || lesson.id} onDeleted={() => onLessonDeleted(chapter._id, lesson._id || lesson.id)} />
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground p-3 pl-8">No lessons yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// ====== Delete Buttons ======
function ChapterDeleteButton({ chapterId, onDeleted }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await api.delete(`/courses/chapters/${chapterId}`);
    toast.success("Chapter deleted");
    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
        <Trash2 className="h-3 w-3" />
      </Button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Chapter"
        description="Are you sure you want to delete this chapter and all its lessons? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}

function LessonDeleteButton({ chapterId, lessonId, onDeleted }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await api.delete(`/courses/chapters/${chapterId}/lessons/${lessonId}`);
    toast.success("Lesson deleted");
    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
        <Trash2 className="h-3 w-3" />
      </Button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}

// ====== Draggable Chapter Item ======
function DraggableChapterItem({ chapter, courseId, onChapterDeleted, onLessonAdded, onLessonDeleted }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter._id, data: { type: "chapter" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={`flex items-center gap-2 mb-1 ${isDragging ? 'opacity-50' : ''}`}>
        <Button size="icon" variant="ghost" {...listeners} className="cursor-grab active:cursor-grabbing h-8 w-8 shrink-0">
          <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div className="flex-1">
          <SortableChapter
            chapter={chapter}
            courseId={courseId}
            onChapterDeleted={onChapterDeleted}
            onLessonAdded={onLessonAdded}
            onLessonDeleted={onLessonDeleted}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  );
}

// ====== Draggable Lesson Item ======
function DraggableLessonItem({ lesson, chapterId, onDeleted }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id || lesson.id, data: { type: "lesson", chapterId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={`flex items-center justify-between p-2 pl-8 hover:bg-accent/30 ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <Button {...listeners} variant="ghost" size="icon" className="cursor-grab active:cursor-grabbing h-7 w-7">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </Button>
        <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
        <div>
          <span className="text-sm">{lesson.title}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            {lesson.duration > 0 && <span>{lesson.duration} min</span>}
            {lesson.freePreview && <Badge variant="outline" className="text-[10px] px-1 py-0">Free</Badge>}
          </div>
        </div>
      </div>
      <LessonDeleteButton chapterId={chapterId} lessonId={lesson._id || lesson.id} onDeleted={onDeleted} />
    </div>
  );
}

// ====== Main Page ======
export default function AdminCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    smallDescription: "",
    description: "",
    category: "",
    level: "Beginner",
    pricing: 0,
    duration: 0,
    status: "Draft",
    subtitle: "",
    image: "",
    primaryLanguage: "English",
  });
  const [videos, setVideos] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor"))) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [courseRes, chaptersRes, videosRes] = await Promise.all([
        api.get(`/courses/${courseId}/edit`),
        api.get(`/courses/${courseId}/chapters`),
        api.get(`/courses/${courseId}/videos`),
      ]);
      const c = courseRes.data.data;
      setCourse(c);
      setForm({
        title: c.title || "",
        slug: c.slug || "",
        smallDescription: c.smallDescription || "",
        description: c.description || "",
        category: c.category || "General",
        level: c.level || "Beginner",
        pricing: c.pricing || 0,
        duration: c.duration || 0,
        status: c.status || "Draft",
        subtitle: c.subtitle || "",
        image: c.image || "",
        primaryLanguage: c.primaryLanguage || "English",
      });
      setChapters(chaptersRes.data.data || []);
      setVideos(videosRes.data.data || []);
    } catch {
      toast.error("Failed to load course");
      navigate("/admin/courses");
    } finally {
      setLoading(false);
    }
  };
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, courseId, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/courses/${courseId}`, form);
      toast.success("Course updated successfully");
    } catch {
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    const slug = slugify(form.title, { lower: true, strict: true });
    setForm((f) => ({ ...f, slug }));
  };

  // Chapters CRUD
  const handleChapterCreated = (chapter) => {
    setChapters((prev) => [...prev, chapter]);
  };

  const handleChapterDeleted = (chapterId) => {
    setChapters((prev) => prev.filter((ch) => ch._id !== chapterId));
  };

  const handleLessonAdded = (chapterId, lesson) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch._id === chapterId ? { ...ch, lessons: [...(ch.lessons || []), lesson] } : ch
      )
    );
  };

  const handleLessonUpdated = (chapterId, updatedLesson) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch._id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                (l._id || l.id) === (updatedLesson._id || updatedLesson.id) ? updatedLesson : l
              ),
            }
          : ch
      )
    );
  };

  const handleLessonDeleted = (chapterId, lessonId) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch._id === chapterId
          ? { ...ch, lessons: ch.lessons.filter((l) => (l._id || l.id) !== lessonId) }
          : ch
      )
    );
  };

  // Drag end handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "chapter") {
      const oldIndex = chapters.findIndex((ch) => ch._id === active.id);
      const newIndex = chapters.findIndex((ch) => ch._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newChapters = arrayMove(chapters, oldIndex, newIndex);
      setChapters(newChapters);

      // Persist to server
      try {
        await api.put(`/courses/${courseId}/chapters/reorder`, {
          chapters: newChapters.map((ch, i) => ({ id: ch._id, position: i })),
        });
      } catch {
        toast.error("Failed to reorder chapters");
      }
    }

    if (activeType === "lesson" && overType === "lesson") {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;

      if (!chapterId || chapterId !== overChapterId) return;

      const chapterIndex = chapters.findIndex((ch) => ch._id === chapterId);
      if (chapterIndex === -1) return;

      const chapter = chapters[chapterIndex];
      const lessons = chapter.lessons || [];
      const oldIndex = lessons.findIndex((l) => (l._id || l.id) === active.id);
      const newIndex = lessons.findIndex((l) => (l._id || l.id) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex] = { ...chapter, lessons: newLessons };
      setChapters(updatedChapters);

      // Persist to server
      try {
        await api.put(`/courses/chapters/${chapterId}/lessons/reorder`, {
          lessons: newLessons.map((l, i) => ({ id: l._id || l.id, position: i })),
        });
      } catch {
        toast.error("Failed to reorder lessons");
      }
    }
  };


  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor")) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar
          showBack
          title={`Edit Course: ${course?.title || ""}`}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
              <TabsTrigger value="videos">
                Videos
                {videos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {videos.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic-info" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Info</CardTitle>
                  <CardDescription>Edit basic information about the course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <div className="flex gap-2">
                        <Input
                          value={form.slug}
                          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={generateSlug} size="sm">
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={form.subtitle}
                      onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Small Description</Label>
                    <Textarea
                      value={form.smallDescription}
                      onChange={(e) => setForm((f) => ({ ...f, smallDescription: e.target.value }))}
                      maxLength={300}
                    />
                    <p className="text-xs text-muted-foreground">{form.smallDescription.length}/300</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Full Description</Label>
                    <RichTextEditor
                      value={form.description}
                      onChange={(html) => setForm((f) => ({ ...f, description: html }))}
                      placeholder="Detailed description of your course..."
                      minHeight="250px"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Thumbnail Image</Label>
                    <FileUploader
                      value={form.image}
                      onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                      endpoint="/media/upload"
                    />
                    {form.image && (
                      <div className="mt-2 rounded-lg overflow-hidden w-48 h-28 border">
                        <img src={form.image} alt="Thumbnail preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select
                        value={form.level}
                        onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Language</Label>
                      <Input
                        value={form.primaryLanguage}
                        onChange={(e) => setForm((f) => ({ ...f, primaryLanguage: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.pricing}
                        onChange={(e) => setForm((f) => ({ ...f, pricing: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (hours)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.duration}
                        onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Course Structure Tab */}
            <TabsContent value="course-structure" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Course Structure</CardTitle>
                    <CardDescription>Drag and drop to reorder chapters and lessons</CardDescription>
                  </div>
                  <NewChapterModal courseId={courseId} onChapterCreated={handleChapterCreated} />
                </CardHeader>
                <CardContent>
                  <DndContext
                    collisionDetection={rectIntersection}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                  >
                    {chapters.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                        <h3 className="font-semibold mb-1">No chapters yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Start building your course by adding chapters
                        </p>
                        <NewChapterModal courseId={courseId} onChapterCreated={handleChapterCreated} />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <SortableContext
                          items={chapters.map((ch) => ch._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {chapters.map((chapter, idx) => (
                            <div key={chapter._id}>
                              {idx > 0 && <Separator className="my-3" />}
                              <DraggableChapterItem
                                chapter={chapter}
                                courseId={courseId}
                                index={idx}
                                onChapterDeleted={handleChapterDeleted}
                                onLessonAdded={handleLessonAdded}
                                onLessonUpdated={handleLessonUpdated}
                                onLessonDeleted={handleLessonDeleted}
                              />
                            </div>
                          ))}
                        </SortableContext>
                      </div>
                    )}
                  </DndContext>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Videos</CardTitle>
                  <CardDescription>Upload and manage course videos. Supported formats: MP4, WebM, MOV (max 500 MB)</CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoUploader
                    courseId={courseId}
                    videos={videos}
                    onVideoUpload={(newVideo) => {
                      setVideos((prev) => [...prev, newVideo]);
                    }}
                    onVideoDelete={(videoId) => {
                      setVideos((prev) => prev.filter((v) => v._id !== videoId));
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}