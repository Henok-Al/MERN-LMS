import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { School, TimerIcon, PlayCircle } from "lucide-react";

// Public course card (for browsing)
export function PublicCourseCard({ data }) {
  const navigate = useNavigate();

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge>
      <div className="relative aspect-video bg-muted overflow-hidden">
        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <PlayCircle className="h-12 w-12 text-primary/40" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <Link
          to={`/courses/${data.slug}`}
          className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors"
        >
          {data.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground mt-2 leading-tight">
          {data.smallDescription}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TimerIcon className="h-5 w-5 p-1 rounded-md text-primary bg-primary/10" />
            <span>{data.duration || 0}h</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <School className="h-5 w-5 p-1 rounded-md text-primary bg-primary/10" />
            <span>{data.category}</span>
          </div>
        </div>
        <Button
          className="w-full mt-4"
          size="sm"
          onClick={() => navigate(`/courses/${data.slug}`)}
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}

// Enrolled course card (with progress)
export function EnrolledCourseCard({ data }) {
  const navigate = useNavigate();
  const course = data.Course || data.course || data;
  const progress = data.progress || 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <Badge className="absolute top-2 right-2 z-10">{course.level}</Badge>
      <div className="relative aspect-video bg-muted overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <PlayCircle className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/80">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <CardContent className="p-4">
        <Link
          to={`/dashboard/course/${course._id}`}
          className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors"
        >
          {course.title}
        </Link>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <Button
          className="w-full mt-4"
          size="sm"
          onClick={() => navigate(`/dashboard/course/${course._id}`)}
        >
          {progress > 0 ? "Continue" : "Start Course"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PublicCourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </CardContent>
    </Card>
  );
}