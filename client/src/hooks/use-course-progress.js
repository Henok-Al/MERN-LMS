import { useMemo } from "react";

export function useCourseProgress({ courseData }) {
  const progress = useMemo(() => {
    if (!courseData?.chapters) {
      return { totalLessons: 0, completedLessons: 0, progressPercentage: 0 };
    }

    const allLessons = courseData.chapters.flatMap((ch) => ch.lessons || []);
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter(
      (lesson) => lesson.progress?.completed
    ).length;
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return { totalLessons, completedLessons, progressPercentage };
  }, [courseData]);

  return progress;
}