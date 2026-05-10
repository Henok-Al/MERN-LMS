import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  PlusCircle,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  FolderKanban,
  Users,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function InstructorSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <div className="w-64 border-r bg-card hidden lg:flex flex-col shrink-0">
      {/* Brand */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">Skillio</span>
        </Link>
      </div>

      {/* Quick Create Button */}
      <div className="p-4 border-b">
        <Button
          className="w-full"
          onClick={() => navigate("/instructor/create")}
        >
          <Zap className="h-4 w-4 mr-2" />
          Quick Create
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link to="/instructor" className={linkClass("/instructor")}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link to="/instructor/courses" className={linkClass("/instructor/courses")}>
          <BookOpen className="h-4 w-4" />
          Courses
        </Link>
        <Link to="/instructor/analytics" className={linkClass("/instructor/analytics")}>
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Link>
        <Link to="/instructor/projects" className={linkClass("/instructor/projects")}>
          <FolderKanban className="h-4 w-4" />
          Projects
        </Link>
        <Link to="/instructor/team" className={linkClass("/instructor/team")}>
          <Users className="h-4 w-4" />
          Team
        </Link>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.userName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}