import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar({
  title,
  showBack,
  onMenuToggle,
  rightContent,
  centerLinks,
  showBrand = true,
  showAuth = true,
}) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="h-16 border-b flex items-center px-4 lg:px-6 gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50 shrink-0">
      {/* Brand */}
      {showBrand && (
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl tracking-tight hidden sm:inline">
            Skillio
          </span>
        </Link>
      )}

      {/* Mobile menu toggle */}
      {onMenuToggle && (
        <button className="lg:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Back button */}
      {showBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
      )}

      {/* Center links */}
      {centerLinks && (
        <nav className="hidden md:flex items-center gap-6">
          {centerLinks}
        </nav>
      )}

      {/* Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        )}
      </div>

      {/* Right side custom content */}
      {rightContent}

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Auth Section - Profile Dropdown or Sign In */}
      {showAuth && (
        isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-accent rounded-full"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(user.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-tight">
                    {user.userName}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize leading-tight">
                    {user.role}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getInitials(user.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.userEmail}</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              {user?.role === "student" && (
                <>
                  <DropdownMenuItem onClick={() => navigate("/courses")}>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Courses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Courses
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => navigate("/profile")}>
                 <Settings className="h-4 w-4 mr-2" />
                 Settings
               </DropdownMenuItem>
               <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Get Started <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )
      )}
    </header>
  );
}