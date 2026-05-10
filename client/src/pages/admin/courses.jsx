import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  Loader2,
  PlusCircle,
  FileText,
  Edit,
  Trash2,
  Eye,
  Globe,
  PlayCircle,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  Home,
  MoreVertical,
  School,
  TimerIcon,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import api from "@/lib/api";

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
          to="/admin/users"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Users className="h-4 w-4" />
          Users
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

function DeleteCourseDialog({ course, open, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/courses/${course._id}`);
      toast.success("Course deleted successfully");
      onOpenChange(false);
      onDeleted(course._id);
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{course?.title}</strong>? This action cannot be undone and will delete all chapters, lessons, and enrollments associated with this course.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Delete Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCoursesPage() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor"))) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(user?.role === "admin" ? "/courses/admin/all" : "/courses/my-courses");
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
  }, [isAuthenticated, user?.role]);

  const handleDeleteRequest = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleted = (courseId) => {
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
    setCourseToDelete(null);
  };

  const togglePublish = async (course) => {
    try {
      const newStatus = course.status === "Published" ? "Draft" : "Published";
      await api.put(`/courses/${course._id}`, { status: newStatus });
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Course ${newStatus === "Published" ? "published" : "unpublished"} successfully`);
    } catch {
      toast.error("Failed to update course status");
    }
  };

  if (isLoading) {
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
          title="Courses"
          onMenuToggle={() => setMobileMenuOpen(true)}
          rightContent={
            <Link to="/admin/courses/create" className={buttonVariants({ size: "sm" })}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Create Course
            </Link>
          }
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-16 text-center max-w-lg mx-auto mt-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h2 className="text-xl font-bold mb-2">No courses yet</h2>
              <p className="text-muted-foreground mb-6">Create your first course and start teaching!</p>
              <Button onClick={() => navigate("/admin/courses/create")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course._id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                    {/* Status badge */}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        course.status === "Published"
                          ? "bg-green-500/90 text-white"
                          : "bg-yellow-500/90 text-white"
                      }`}
                    >
                      {course.status}
                    </span>
                    {/* Dropdown menu */}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course._id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                          {course.status === "Published" && (
                            <DropdownMenuItem onClick={() => navigate(`/courses/${course.slug}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => togglePublish(course)}>
                            <Globe className="h-4 w-4 mr-2" />
                            {course.status === "Published" ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteRequest(course)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    <Link
                      to={`/admin/courses/${course._id}`}
                      className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors"
                    >
                      {course.title}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-tight">
                      {course.smallDescription || "No description provided"}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <TimerIcon className="h-5 w-5 rounded-md p-1 text-primary bg-primary/10" />
                        <span className="text-sm text-muted-foreground">{course.duration || 0}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 rounded-md p-1 text-primary bg-primary/10" />
                        <span className="text-sm text-muted-foreground">{course.level || "Beginner"}</span>
                      </div>
                      <div className="ml-auto text-sm font-medium">
                        ${course.pricing || 0}
                      </div>
                    </div>
                    <Link
                      to={`/admin/courses/${course._id}`}
                      className={buttonVariants({ className: "w-full mt-1", variant: "default" })}
                    >
                      Edit Course
                      <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteCourseDialog
        course={courseToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}