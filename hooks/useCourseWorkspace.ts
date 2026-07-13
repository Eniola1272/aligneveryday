import { useMemo } from "react";

import { useProductivity } from "@/contexts/ProductivityContext";
import type { CourseMilestone, CourseWorkspace } from "@/types/learning";
import { getProgressPercentage } from "@/utils/time";

const progressMilestoneTemplates = [
  {
    id: "start",
    targetPercentage: 0,
    title: "Start",
    meta: "You’ve opened the path. Tiny momentum counts.",
  },
  {
    id: "quarter",
    targetPercentage: 25,
    title: "Quarter done",
    meta: "You’re building proof, not just consuming content.",
  },
  {
    id: "middle",
    targetPercentage: 50,
    title: "Middle",
    meta: "Halfway in. This is where consistency starts to compound.",
  },
  {
    id: "last-quarter",
    targetPercentage: 75,
    title: "Last quarter",
    meta: "Almost there. Finish strong and turn this into portfolio value.",
  },
  {
    id: "end",
    targetPercentage: 100,
    title: "End",
    meta: "Completed. Capture the outcome while it’s fresh.",
  },
] as const;

export function buildCourseProgressMilestones(
  currentProgressSec: number,
  totalDurationSec: number,
): CourseMilestone[] {
  const progressPercentage = getProgressPercentage(
    currentProgressSec,
    totalDurationSec,
  );
  const nextIndex = progressMilestoneTemplates.findIndex(
    (milestone) => milestone.targetPercentage > progressPercentage,
  );

  return progressMilestoneTemplates.map((milestone, index) => {
    const isCompleted = progressPercentage >= milestone.targetPercentage;
    const isCurrent =
      !isCompleted && index === (nextIndex === -1 ? undefined : nextIndex);

    return {
      ...milestone,
      state: isCompleted ? "completed" : isCurrent ? "current" : "upcoming",
      meta:
        milestone.targetPercentage === 100 && progressPercentage >= 100
          ? "Finished. Now turn the learning into visible proof."
          : milestone.meta,
    };
  });
}

const unavailableCourse: CourseWorkspace = {
  id: "unavailable",
  user_id: "",
  title: "Course unavailable",
  platform: "Custom",
  source_url: null,
  total_duration_sec: 0,
  current_progress_sec: 0,
  status: "backlog",
  milestones: [
    {
      id: "unavailable",
      title: "Return to your shelf",
      meta: "This learning path could not be found.",
      state: "upcoming",
    },
  ],
};

export function useCourseWorkspace(courseId?: string) {
  const workspace = useProductivity();

  const courseWorkspace = useMemo<CourseWorkspace>(() => {
    const course = workspace.courses.find((item) => item.id === courseId);
    if (!course) return unavailableCourse;

    const milestones = buildCourseProgressMilestones(
      course.current_progress_sec,
      course.total_duration_sec,
    );

    return { ...course, milestones };
  }, [courseId, workspace.courses]);

  return {
    workspace: courseWorkspace,
    isLoading: workspace.isLoading,
    isMockData: false,
    updateProgress: workspace.updateCourseProgress,
    updateStatus: workspace.updateCourseStatus,
    updateCourse: workspace.updateCourse,
  };
}
