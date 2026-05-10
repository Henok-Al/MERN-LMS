import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Loader2,
  LayoutDashboard,
  BookOpen,
  Users,
  Eye,
  TrendingUp,
  Clock,
  PlusCircle,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InstructorSidebar from "@/components/instructor-sidebar";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

export default function InstructorDashboard() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    draftCourses: 0,
  });

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    ) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/courses/my-courses");
        const data = res.data.data || [];
        setCourses(data);
        setStats({
          totalCourses: data.length,
          publishedCourses: data.filter((c) => c.status === "Published").length,
          draftCourses: data.filter((c) => c.status === "Draft").length,
          totalEnrollments: 0, // placeholder until enrollments API is added
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

  if (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    return null;

  const statCards = [
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Published",
      value: stats.publishedCourses,
      icon: Eye,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Drafts",
      value: stats.draftCourses,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Enrollments",
      value: stats.totalEnrollments,
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar
          title="Dashboard"
          rightContent={
            <Button size="sm" onClick={() => navigate("/instructor/create")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Quick Create
            </Button>
          }
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Recent Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Courses</h2>
              <Link
                to="/instructor/courses"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : courses.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold mb-1">No courses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first course to get started
                </p>
                <Button onClick={() => navigate("/instructor/create")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => navigate(`/instructor/edit/${course._id}`)}
                  >
                    <div className="w-16 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <PlayCircle className="h-4 w-4 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {course.level} &middot; {course.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        course.status === "Published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/instructor/create"
              className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
            >
              <PlusCircle className="h-5 w-5 text-primary mb-2" />
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                Create Course
              </h3>
              <p className="text-xs text-muted-foreground">
                Build a new course from scratch
              </p>
            </Link>
            <Link
              to="/instructor/analytics"
              className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
            >
              <TrendingUp className="h-5 w-5 text-primary mb-2" />
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                View Analytics
              </h3>
              <p className="text-xs text-muted-foreground">
                Track student performance
              </p>
            </Link>
            <Link
              to="/instructor/team"
              className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
            >
              <Users className="h-5 w-5 text-primary mb-2" />
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                Manage Team
              </h3>
              <p className="text-xs text-muted-foreground">
                Invite co-instructors
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}