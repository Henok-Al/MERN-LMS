import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InstructorSidebar from "@/components/instructor-sidebar";
import Navbar from "@/components/navbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import api from "@/lib/api";

const defaultEnrollmentData = [
  { month: "Jan", enrollments: 0 },
  { month: "Feb", enrollments: 0 },
  { month: "Mar", enrollments: 0 },
  { month: "Apr", enrollments: 0 },
  { month: "May", enrollments: 0 },
  { month: "Jun", enrollments: 0 },
];

const defaultCoursePerformance = [
  { name: "None", students: 0, lessons: 0 },
];

export default function InstructorAnalytics() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState(defaultEnrollmentData);
  const [coursePerformance, setCoursePerformance] = useState(defaultCoursePerformance);

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    ) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/instructor/course/stats");
        const data = res.data.data;
        if (data) {
          setStats({
            totalCourses: data.stats.totalCourses,
            publishedCourses: data.stats.publishedCourses,
            totalEnrollments: data.stats.totalEnrollments,
            completionRate: data.stats.completionRate,
          });
          if (data.enrollmentData?.length > 0) {
            setEnrollmentData(data.enrollmentData);
          }
          if (data.coursePerformance?.length > 0) {
            setCoursePerformance(
              data.coursePerformance.map((c) => ({
                name: c.title.substring(0, 25),
                students: 0,
                lessons: 0,
              }))
            );
          }
        }
      } catch {
        // silently fail - uses default data
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchAnalytics();
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
    { label: "Total Enrollments", value: stats.totalEnrollments, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Published Courses", value: stats.publishedCourses, icon: Eye, color: "text-green-600 bg-green-100" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
    { label: "Total Courses", value: stats.totalCourses, icon: Clock, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Analytics" />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Enrollment Chart */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold mb-4">Enrollment Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={enrollmentData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEnrollments)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Course Performance */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold mb-4">Course Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={coursePerformance} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="students" name="Students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lessons" name="Lessons" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}