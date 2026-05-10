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
  PlayCircle,
  ShoppingCart,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

function AdminSidebar({ pathname }) {
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
          to="/admin/users"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/admin/users")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
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
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [enrollmentChartData, setEnrollmentChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor"))) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get("/users/admin/stats"),
          api.get("/users/admin/enrollment-stats").catch(() => null),
        ]);
        const stats = statsRes.data.data;

        if (chartRes?.data?.data) {
          setEnrollmentChartData(chartRes.data.data);
        }

        // Calculate monthly growth (mock)
        const publishedLastMonth = Math.max(1, stats.courses.published - 1);

        setStats({
          totalUsers: stats.users.total,
          totalInstructors: stats.users.instructors,
          totalStudents: stats.users.students,
          totalCourses: stats.courses.total,
          publishedCourses: stats.courses.published,
          draftCourses: stats.courses.drafts,
          totalEnrollments: stats.enrollments.total,
          totalRevenue: stats.enrollments.revenue,
          totalLessons: stats.courses.totalLessons || 0,
          growth: Math.round(
            ((stats.courses.published - publishedLastMonth) / publishedLastMonth) * 100
          ),
          recentEnrollments: stats.recentEnrollments,
          popularCourses: stats.popularCourses,
        });
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

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor")) return null;

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
                <span className="font-bold text-sidebar-foreground">Skillio Admin</span>
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
        <Navbar
          title={`${user?.role === "admin" ? "Admin" : "Instructor"} Dashboard`}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Signups
                    </CardTitle>
                    <div className="flex items-center gap-2 pt-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold tabular-nums">
                        {stats?.totalUsers || 0}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Registered users
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalStudents || 0} students, {stats?.totalInstructors || 0} instructors
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Customers
                    </CardTitle>
                    <div className="flex items-center gap-2 pt-2">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold tabular-nums">
                        {stats?.totalStudents || 0}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      Enrolled users
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalEnrollments || 0} total enrollments
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Courses
                    </CardTitle>
                    <div className="flex items-center gap-2 pt-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold tabular-nums">
                        {stats?.totalCourses || 0}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stats?.publishedCourses || 0} published
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {stats?.draftCourses || 0} drafts
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Lessons
                    </CardTitle>
                    <div className="flex items-center gap-2 pt-2">
                      <PlayCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold tabular-nums">
                        {stats?.totalLessons || 0}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      Across all courses
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Learning content
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Enrollment Chart */}
              <ChartAreaInteractive data={enrollmentChartData} />

              {/* Quick Actions & Account Info */}
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
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate("/admin/users")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium">${stats?.totalRevenue || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Enrollments */}
              <div>
                <h2 className="text-xl font-bold mb-4">Recent Enrollments</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-semibold">Student</th>
                            <th className="text-left p-4 font-semibold">Course</th>
                            <th className="text-left p-4 font-semibold">Amount</th>
                            <th className="text-left p-4 font-semibold">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentEnrollments?.length > 0 ? (
                            stats.recentEnrollments.map((enrollment) => (
                              <tr key={enrollment._id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{enrollment.userId?.userName || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="p-4">{enrollment.courseId?.title || 'N/A'}</td>
                                <td className="p-4">${enrollment.amount || 0}</td>
                                <td className="p-4">
                                  {new Date(enrollment.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="p-4 text-center text-muted-foreground">
                                No recent enrollments
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Courses */}
              <div>
                <h2 className="text-xl font-bold mb-4">Popular Courses</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats?.popularCourses?.length > 0 ? (
                    stats.popularCourses.map((course) => (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{course.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {course.enrollmentCount} enrollments
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No course data available
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}