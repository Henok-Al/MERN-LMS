import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  ArrowRight,
  Clock,
  School,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle,
  Lock,
  FileText,
  Users,
  Star,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function CourseDetailPage() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/slug/${slug}`);
        setData(res.data.data);
        // Expand first chapter by default
        if (res.data.data.chapters?.length > 0) {
          setExpandedChapters({ [res.data.data.chapters[0]._id]: true });
        }
      } catch {
        setError("Course not found");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setEnrolling(true);
    try {
      await api.post("/courses/enroll", { courseId: data.course._id });
      navigate(`/dashboard/course/${data.course._id}`);
    } catch (err) {
      if (err.response?.status === 400) {
        navigate(`/dashboard/course/${data.course._id}`);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <GraduationCap className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course not found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
      </div>
    );
  }

  const { course, chapters } = data;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HEADER */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-3 text-primary" />
          <span className="font-extrabold text-xl tracking-tight">
            Know Thyself
          </span>
        </Link>
        <nav className="ml-8 hidden md:flex items-center gap-6">
          <Link
            to="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Courses
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.userName}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {user.role}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Course Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {course.level}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {course.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {course.subtitle || course.smallDescription}
                </p>
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration || 0}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {chapters?.reduce(
                        (acc, ch) => acc + (ch.lessons?.length || 0),
                        0
                      )}{" "}
                      lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <School className="h-4 w-4" />
                    <span>{course.instructorName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-bold">
                    {course.pricing > 0
                      ? `$${course.pricing}`
                      : "Free"}
                  </p>
                  <Button size="lg" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : isAuthenticated ? (
                      "Enroll Now"
                    ) : (
                      "Sign In to Enroll"
                    )}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <PlayCircle className="h-20 w-20 text-primary/30" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              {course.description && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </section>
              )}

              {/* Objectives */}
              {course.objectives && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">
                    What You'll Learn
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {course.objectives}
                  </div>
                </section>
              )}

              {/* Course Curriculum */}
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  Course Curriculum
                </h2>
                <div className="space-y-2">
                  {chapters?.length > 0 ? (
                    chapters.map((chapter, idx) => (
                      <div
                        key={chapter._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleChapter(chapter._id)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Chapter {idx + 1}
                            </span>
                            <span className="font-semibold">
                              {chapter.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {chapter.lessons?.length || 0} lessons
                            </span>
                            {expandedChapters[chapter._id] ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        {expandedChapters[chapter._id] && (
                          <div className="divide-y">
                            {chapter.lessons?.map((lesson, lIdx) => (
                              <div
                                key={lesson._id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                              >
                                {lesson.freePreview ? (
                                  <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="text-sm flex-1">
                                  {lIdx + 1}. {lesson.title}
                                </span>
                                {lesson.duration > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.duration}min
                                  </span>
                                )}
                                {lesson.freePreview && (
                                  <span className="text-xs text-primary font-medium">
                                    Preview
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No curriculum available yet</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Course Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {course.duration || 0}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">
                      {course.primaryLanguage}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor</span>
                    <span className="font-medium">
                      {course.instructorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-bold text-lg">
                      {course.pricing > 0
                        ? `$${course.pricing}`
                        : "Free"}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : isAuthenticated ? (
                    "Enroll Now"
                  ) : (
                    "Sign In to Enroll"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Know Thyself</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Know Thyself LMS. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}