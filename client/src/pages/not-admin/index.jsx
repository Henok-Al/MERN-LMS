import { Link } from "react-router-dom";
import { GraduationCap, ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotAdminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-3 text-primary" />
          <span className="font-extrabold text-xl tracking-tight">Skillio</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
          <p className="text-muted-foreground mb-2 text-lg">
            You don't have permission to access this area.
          </p>
          <p className="text-muted-foreground mb-8">
            This page is restricted to administrators only.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = "/"}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}