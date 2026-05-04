import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Home,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import api from "@/lib/api";

function AdminSidebar({ pathname }) {
  return (
    <div className="w-64 border-r bg-sidebar flex-col shrink-0 hidden lg:flex">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-sidebar-foreground">LMS Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/admin"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="/admin/courses"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/admin/courses")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
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
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3">
            Navigation
          </p>
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

export default function AdminDashboard() {
  const { user, logout, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "instructor")) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const coursesRes = await api.get("/courses/my-courses");
        const courses = coursesRes.data.data || [];
        const totalStudents = courses.reduce(
          (acc, c) => acc + (c.students?.length || 0),
          0
        );
        const totalRevenue = courses.reduce(
          (acc, c) => acc + (c.pricing || 0) * (c.students?.length || 0),
          0
        );
        const publishedCourses = courses.filter(
          (c) => c.status === "Published"
        ).length;
        const draftCourses = courses.filter(
          (c) => c.status === "Draft"
        ).length;

        // Calculate monthly growth (mock)
        const publishedLastMonth = Math.max(1, publishedCourses - 1);

        setStats({
          totalCourses: courses.length,
          publishedCourses,
          draftCourses,
          totalStudents,
          totalRevenue,
          growth: Math.round(
            ((publishedCourses - publishedLastMonth) / publishedLastMonth) * 100
          ),
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

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
      <AdminSidebar pathname={location.pathname} />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r p-4">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-sidebar-primary" />
                <span className="font-bold text-sidebar-foreground">LMS Admin</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-sidebar-foreground" />
              </button>
            </div>
            <AdminSidebar pathname={location.pathname} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b flex items-center px-4 lg:px-6 gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
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
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Courses
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.totalCourses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.publishedCourses || 0} published,{" "}
                      {stats?.draftCourses || 0} drafts
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.totalStudents || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enrolled across all courses
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${stats?.totalRevenue || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total earnings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Growth Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.growth || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Month over month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate("/admin/courses/create")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Course
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate("/admin/courses")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Courses
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{user?.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{user?.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {user?.role}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}