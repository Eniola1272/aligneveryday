import type { Course, LearningPlatform, Todo } from '@/types/database';

export interface CourseMilestone {
  id: string;
  title: string;
  meta: string;
  state: 'completed' | 'current' | 'upcoming';
}

export interface CourseWorkspace extends Course {
  milestones: CourseMilestone[];
}

export interface DashboardTodo extends Todo {
  courseLabel: string | null;
}

export interface AddShelfDraft {
  sourceUrl: string;
  platform: LearningPlatform;
  hours: number;
  minutes: number;
}
