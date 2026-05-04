import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  ArrowRight,
  PlayCircle,
  Clock,
  School,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function CoursesPage() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/published");
        setCourses(res.data.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase()) ||
      course.category?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

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
            className="text-sm font-medium text-foreground"
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
        <div className="container max-w-6xl mx-auto px-4 py-10">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Explore Courses
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover our wide range of courses designed to help you advance
              your knowledge.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <PlayCircle className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                      {course.level}
                    </span>
                  </div>
                  <div className="p-4">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors"
                    >
                      {course.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {course.smallDescription || course.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{course.duration || 0}h</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <School className="h-3.5 w-3.5" />
                        <span>{course.category}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => navigate(`/courses/${course.slug}`)}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No courses found
              </h3>
              <p className="text-muted-foreground">
                {search
                  ? "Try adjusting your search or filters."
                  : "No courses available yet. Check back soon!"}
              </p>
            </div>
          )}
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