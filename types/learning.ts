import type {
  Course,
  CourseStatus,
  LearningPlatform,
  Todo,
} from "@/types/database";

export interface CourseMilestone {
  id: string;
  title: string;
  meta: string;
  state: "completed" | "current" | "upcoming";
  targetPercentage?: number;
}

export interface CourseWorkspace extends Course {
  milestones: CourseMilestone[];
}

export interface DashboardTodo extends Todo {
  courseLabel: string | null;
}

export interface TodoDraft {
  title: string;
  courseId: string | null;
  startDate: string | null;
  dueDate: string | null;
}

export interface AddShelfDraft {
  title: string;
  sourceUrl: string;
  platform: LearningPlatform;
  hours: number;
  minutes: number;
  status: CourseStatus;
}
