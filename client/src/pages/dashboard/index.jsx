import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  ArrowRight,
  BookOpen,
  Clock,
  School,
  Loader2,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  BookMarked,
  LayoutDashboard,
  Users,
  PlusCircle,
  FileText,
  Home,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

// Dashboard Sidebar Component
function DashboardSidebar({ user, pathname }) {
  return (
    <div className="w-64 border-r bg-card hidden lg:flex flex-col shrink-0">
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">Skillio</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="/courses"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/courses")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Browse Courses
        </Link>
        {user?.role === "instructor" && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Instructor
              </p>
            </div>
            <Link
              to="/instructor"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/instructor")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <FileText className="h-4 w-4" />
              My Courses
            </Link>
            <Link
              to="/instructor/create"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Create Course
            </Link>
          </>
        )}
      </nav>
      <div className="p-4 border-t">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrolledRes, coursesRes] = await Promise.all([
          api.get("/courses/enrolled"),
          api.get("/courses/published"),
        ]);
        const enrolled = enrolledRes.data.data || [];
        const allCourses = coursesRes.data.data || [];
        setEnrolledCourses(enrolled);
        setAvailableCourses(
          allCourses.filter(
            (c) =>
              !enrolled.some((e) => e.Course?._id === c._id)
          )
        );
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DashboardSidebar user={user} pathname={location.pathname} />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r p-4">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold">Skillio</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <DashboardSidebar user={user} pathname={location.pathname} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <Navbar title="Dashboard" onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Dashboard Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Enrolled Courses Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Enrolled Courses
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Continue your learning journey
                    </p>
                  </div>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="border-2 border-dashed rounded-xl p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No courses enrolled yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Browse our available courses and start learning today!
                    </p>
                    <Button onClick={() => navigate("/courses")}>
                      Browse Courses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCourses.map((item) => {
                      const course = item.Course;
                      const progress = item.progress || 0;
                      return (
                        <div
                          key={course?._id || Math.random()}
                          className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            {course?.image ? (
                              <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                <PlayCircle className="h-12 w-12 text-primary/40" />
                              </div>
                            )}
                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/80 backdrop-blur-sm">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="p-4">
                            <Link
                              to={`/dashboard/course/${course?._id}`}
                              className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors"
                            >
                              {course?.title}
                            </Link>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <BarChart3 className="h-3.5 w-3.5" />
                                <span>{progress}%</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <School className="h-3.5 w-3.5" />
                                <span>{course?.category}</span>
                              </div>
                            </div>
                            <Button
                              className="w-full mt-4"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/dashboard/course/${course?._id}`
                                )
                              }
                            >
                              {progress > 0 ? "Continue" : "Start Course"}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Available Courses Section */}
              {availableCourses.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Available Courses
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Courses you can enroll in
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/courses")}
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableCourses.slice(0, 6).map((course) => (
                      <div
                        key={course._id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(`/courses/${course.slug}`)
                        }
                      >
                        <div className="w-16 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.level} &middot; {course.duration || 0}h
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}