import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Menu,
  X,
  CheckCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function CourseViewPage() {
  const { user, logout, isAuthenticated, isLoading } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      const res = await api.get(`/courses/sidebar/${courseId}`);
      setData(res.data.data);
      // Set first lesson as current
      const firstChapter = res.data.data.chapters?.[0];
      if (firstChapter?.lessons?.length > 0) {
        setCurrentLesson(firstChapter.lessons[0]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourseData();
    }
  }, [isAuthenticated, fetchCourseData]);

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
  };

  const toggleComplete = async () => {
    if (!currentLesson || !courseId) return;
    setMarkingComplete(true);
    try {
      const newCompleted = !currentLesson.progress?.completed;
      await api.post("/courses/lesson-progress", {
        lessonId: currentLesson._id,
        courseId,
        completed: newCompleted,
      });
      // Update local state
      setCurrentLesson((prev) => ({
        ...prev,
        progress: { completed: newCompleted },
      }));
      // Refresh sidebar data
      fetchCourseData();
    } catch {
      // silently fail
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Calculate overall progress
  const allLessons =
    data?.chapters?.flatMap((ch) => ch.lessons) || [];
  const completedLessons = allLessons.filter(
    (l) => l.progress?.completed
  ).length;
  const totalProgress =
    allLessons.length > 0
      ? Math.round((completedLessons / allLessons.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <GraduationCap className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-bold mb-2">Course not found</h2>
        <Button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { course, chapters } = data;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-40 w-80 border-r bg-card flex flex-col transition-transform duration-300`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2">
            {course?.title}
          </h3>
          {/* Overall Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{totalProgress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapter / Lesson List */}
        <div className="flex-1 overflow-y-auto">
          {chapters?.map((chapter, chIdx) => (
            <div key={chapter._id} className="border-b last:border-b-0">
              <div className="px-4 py-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Chapter {chIdx + 1}
                  </span>
                </div>
                <p className="text-sm font-medium mt-0.5">
                  {chapter.title}
                </p>
              </div>
              <div>
                {chapter.lessons?.map((lesson) => {
                  const isActive =
                    currentLesson?._id === lesson._id;
                  const isCompleted = lesson.progress?.completed;
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-primary/5 border-l-2 border-primary"
                          : "hover:bg-muted/50 border-l-2 border-transparent"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : isActive ? (
                        <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isActive
                              ? "font-medium text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {lesson.title}
                        </p>
                      </div>
                      {lesson.duration > 0 && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {lesson.duration}min
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b flex items-center px-4 gap-4 bg-background/80 backdrop-blur-sm shrink-0">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">
                {user.userName}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto p-4 lg:p-8">
              {/* Video Player */}
              {currentLesson.videoUrl ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                  <video
                    src={currentLesson.videoUrl}
                    controls
                    className="w-full h-full"
                    key={currentLesson._id}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-primary/40 mb-3" />
                    <p className="text-muted-foreground text-lg font-medium">
                      {currentLesson.title}
                    </p>
                    {currentLesson.duration > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentLesson.duration} minutes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Lesson Info */}
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {currentLesson.title}
                </h1>
                {currentLesson.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {currentLesson.description}
                  </p>
                )}

                {/* Mark Complete Button */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={toggleComplete}
                    disabled={markingComplete}
                    variant={
                      currentLesson.progress?.completed
                        ? "outline"
                        : "default"
                    }
                    className={
                      currentLesson.progress?.completed
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : ""
                    }
                  >
                    {markingComplete ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : currentLesson.progress?.completed ? (
                      <CheckCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    {currentLesson.progress?.completed
                      ? "Completed"
                      : "Mark as Complete"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  No lessons available
                </h2>
                <p className="text-muted-foreground">
                  This course does not have any lessons yet!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}