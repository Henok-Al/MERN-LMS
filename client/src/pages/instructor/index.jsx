import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  Loader2,
  PlusCircle,
  FileText,
  Clock,
  School,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function InstructorDashboard() {
  const { user, logout, isAuthenticated, isLoading } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "instructor")) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/my-courses");
        setCourses(res.data.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated]);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?"))
      return;
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch {
      // silently fail
    }
  };

  const togglePublish = async (course) => {
    try {
      const newStatus =
        course.status === "Published" ? "Draft" : "Published";
      await api.put(`/courses/${course._id}`, { status: newStatus });
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, status: newStatus } : c
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "instructor") return null;

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
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/instructor"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary transition-colors"
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
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <GraduationCap className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">My Courses</h1>
            <p className="text-xs text-muted-foreground">
              Manage your courses and content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate("/instructor/create")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Course
            </Button>
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

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : courses.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-16 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h2 className="text-xl font-bold mb-2">
                No courses yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first course and start teaching!
              </p>
              <Button onClick={() => navigate("/instructor/create")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <PlayCircle className="h-6 w-6 text-primary/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {course.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          course.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : course.status === "Draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{course.level}</span>
                      <span>&middot;</span>
                      <span>{course.category}</span>
                      <span>&middot;</span>
                      <span>{course.duration || 0}h</span>
                      <span>&middot;</span>
                      <span>${course.pricing || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {course.status === "Published" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/courses/${course.slug}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/instructor/edit/${course._id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(course)}
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(course._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}