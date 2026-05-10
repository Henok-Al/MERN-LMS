import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  BookOpen,
  MonitorPlay,
  BarChart3,
  Users,
  ArrowRight,
  PlayCircle,
  Clock,
  School,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

const features = [
  {
    title: "Comprehensive Courses",
    description:
      "Access a wide range of carefully curated courses designed by industry experts.",
    icon: <BookOpen className="w-8 h-8 text-blue-500" />,
  },
  {
    title: "Interactive Learning",
    description:
      "Engage with interactive content, quizzes, and assignments to enhance your learning experience.",
    icon: <MonitorPlay className="w-8 h-8 text-green-500" />,
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your progress and achievements with detailed analytics and personalized dashboards.",
    icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
  },
  {
    title: "Community Support",
    description:
      "Join a vibrant community of learners and instructors to collaborate and share knowledge.",
    icon: <Users className="w-8 h-8 text-orange-500" />,
  },
];

export default function HomePage() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/published");
        setCourses(res.data.data?.slice(0, 6) || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar
        centerLinks={
          <>
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
          </>
        }
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container max-w-6xl mx-auto px-4 relative">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>The future lies in knowing yourself first</span>
              </div>

              <h1 className="text-4xl md:text-7xl font-bold tracking-tight max-w-4xl">
                Elevate Your{" "}
                <span className="text-primary">Learning Experience</span>
              </h1>

              <p className="max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                Discover a new way to learn with a modern, interactive learning
                management system. Access high-quality courses anytime, anywhere
                and track your progress.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg" onClick={() => navigate("/courses")}>
                  Explore Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Why Choose Skillio?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform offers everything you need to succeed in your
                learning journey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="mb-4 p-3 rounded-lg bg-primary/5 w-fit group-hover:bg-primary/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AVAILABLE COURSES SECTION */}
        <section className="py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Available Courses
                </h2>
                <p className="text-muted-foreground">
                  Discover our wide range of courses designed to advance your
                  knowledge
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/courses")}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-card overflow-hidden animate-pulse"
                  >
                    <div className="aspect-video bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
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
              <div className="text-center py-16">
                <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No courses available yet
                </h3>
                <p className="text-muted-foreground">
                  Courses are being created. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-primary/5">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join our community of learners and start your journey towards
              mastering new skills today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Skillio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Skillio. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}