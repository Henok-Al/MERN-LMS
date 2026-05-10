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
  ChevronRight,
  Loader2,
  FileText,
  Menu,
  X,
  CheckCheck,
  Check,
  Play,
  BookOpen,
  ArrowRight,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/navbar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCourseProgress } from "@/hooks/use-course-progress";
import api from "@/lib/api";
import confetti from "canvas-confetti";
import VideoPlayer from "@/components/video-player";

// Lesson Item Component
function LessonItem({ lesson, isActive, completed, onClick }) {
  return (
    <button
      onClick={() => onClick(lesson)}
      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
        completed
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
          : isActive
          ? "bg-primary/10 dark:bg-primary/20 border border-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30"
          : "border border-transparent hover:bg-muted/50"
      }`}
    >
      <div className="shrink-0">
        {completed ? (
          <div className="size-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
            <Check className="size-3 text-white" />
          </div>
        ) : (
          <div
            className={`size-5 rounded-full border-2 bg-background flex items-center justify-center ${
              isActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/50"
            }`}
          >
            <Play
              className={`size-2.5 fill-current ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p
          className={`text-xs font-medium truncate ${
            completed
              ? "text-green-800 dark:text-green-200"
              : isActive
              ? "text-primary font-semibold"
              : "text-foreground"
          }`}
        >
          {lesson.title}
        </p>
        {completed && (
          <p className="text-[10px] text-green-700 dark:text-green-300">
            Completed
          </p>
        )}
        {isActive && !completed && (
          <p className="text-[10px] text-primary font-medium">
            Currently watching
          </p>
        )}
      </div>
    </button>
  );
}

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

  const { totalLessons, completedLessons, progressPercentage } =
    useCourseProgress({ courseData: data });

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
    console.log("Lesson clicked:", lesson);
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

      // Optimistic update
      setCurrentLesson((prev) => ({
        ...prev,
        progress: { completed: newCompleted },
      }));

      // Refresh sidebar data to update all lesson states
      const res = await api.get(`/courses/sidebar/${courseId}`);
      setData(res.data.data);

      // Re-check if course is now fully completed
      if (newCompleted) {
        const allLessons =
          res.data.data?.chapters?.flatMap((ch) => ch.lessons) || [];
        const allDone = allLessons.every((l) => l.progress?.completed);
        if (allDone && allLessons.length > 0) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { x: 0.2, y: 0.7 },
            });
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { x: 0.8, y: 0.7 },
            });
          }, 300);
        }
      }
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
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Course Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Play className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm leading-tight truncate">
                {course?.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {course?.category}
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedLessons}/{totalLessons} lessons
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {progressPercentage}%
            </p>
          </div>
        </div>

        {/* Chapter / Lesson List */}
        <div className="flex-1 overflow-y-auto p-4 pr-2 space-y-3">
          {chapters?.map((chapter, chIdx) => (
            <Collapsible key={chapter._id} defaultOpen={chIdx === 0}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full p-3 h-auto flex items-center gap-2"
                >
                  <div className="shrink-0">
                    <ChevronDown className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">
                      {chIdx + 1}: {chapter.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">
                      {chapter.lessons?.length || 0} lessons
                    </p>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-4 border-l-2 space-y-2">
                {chapter.lessons?.map((lesson) => (
                  <LessonItem
                    key={lesson._id}
                    lesson={lesson}
                    isActive={currentLesson?._id === lesson._id}
                    completed={lesson.progress?.completed}
                    onClick={handleLessonClick}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
          {(!chapters || chapters.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No course content yet</p>
            </div>
          )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-accent rounded-full"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {(user.userName || "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium leading-tight hidden sm:inline">
                  {user.userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {(user.userName || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.userEmail}</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto p-4 lg:p-8">
              {/* Video Player */}
              {currentLesson.videoUrl ? (
                <div className="mb-6">
                  <VideoPlayer
                    src={currentLesson.videoUrl}
                    key={currentLesson._id}
                    className="rounded-xl overflow-hidden"
                  />
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
                        ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
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

                  {/* Progress Summary */}
                  <div className="ml-auto text-sm text-muted-foreground">
                    {completedLessons}/{totalLessons} lessons completed
                  </div>
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