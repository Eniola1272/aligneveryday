import type { Course } from '@/types/database';
import type { CourseWorkspace, DashboardTodo } from '@/types/learning';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

function atLocalHour(dayOffset: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const mockCourses: Course[] = [
  {
    id: 'nextjs-advanced',
    user_id: MOCK_USER_ID,
    title: 'Next.js UI',
    platform: 'YouTube',
    source_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    total_duration_sec: 12000,
    current_progress_sec: 5040,
    status: 'in_progress',
  },
  {
    id: 'personal-knowledge-system',
    user_id: MOCK_USER_ID,
    title: 'Personal Knowledge System',
    platform: 'Udemy',
    source_url: 'https://www.udemy.com/',
    total_duration_sec: 22500,
    current_progress_sec: 15300,
    status: 'in_progress',
  },
  {
    id: 'portfolio-storytelling',
    user_id: MOCK_USER_ID,
    title: 'Portfolio Storytelling',
    platform: 'Coursera',
    source_url: 'https://www.coursera.org/',
    total_duration_sec: 14400,
    current_progress_sec: 4320,
    status: 'in_progress',
  },
];

export const mockTodos: DashboardTodo[] = [
  {
    id: 'todo-1',
    user_id: MOCK_USER_ID,
    course_id: 'nextjs-advanced',
    task_title: 'Finish dashboard wireframe',
    is_completed: false,
    start_date: atLocalHour(0, 0),
    due_date: atLocalHour(0, 18),
    completed_at: null,
    sort_order: 1000,
    courseLabel: 'Next.js UI',
  },
  {
    id: 'todo-2',
    user_id: MOCK_USER_ID,
    course_id: 'personal-knowledge-system',
    task_title: 'Review learning notes',
    is_completed: true,
    start_date: atLocalHour(0, 0),
    due_date: atLocalHour(0, 18),
    completed_at: atLocalHour(0, 11),
    sort_order: 2000,
    courseLabel: 'PKS',
  },
  {
    id: 'todo-3',
    user_id: MOCK_USER_ID,
    course_id: 'nextjs-advanced',
    task_title: 'Refactor course progress logic',
    is_completed: false,
    start_date: atLocalHour(1, 0),
    due_date: atLocalHour(1, 18),
    completed_at: null,
    sort_order: 3000,
    courseLabel: 'Next.js UI',
  },
  {
    id: 'todo-4',
    user_id: MOCK_USER_ID,
    course_id: null,
    task_title: 'Upload portfolio case study',
    is_completed: true,
    start_date: atLocalHour(-2, 0),
    due_date: atLocalHour(-1, 18),
    completed_at: atLocalHour(-1, 16),
    sort_order: 4000,
    courseLabel: 'Portfolio',
  },
  {
    id: 'todo-5',
    user_id: MOCK_USER_ID,
    course_id: 'personal-knowledge-system',
    task_title: 'Plan tomorrow’s focus block',
    is_completed: false,
    start_date: null,
    due_date: null,
    completed_at: null,
    sort_order: 5000,
    courseLabel: 'PKS',
  },
];

export const mockWorkspaces: Record<string, CourseWorkspace> = {
  'nextjs-advanced': {
    ...mockCourses[0],
    title: 'Next.js Advanced Architecture',
    total_duration_sec: 7737,
    current_progress_sec: 5025,
    milestones: [
      { id: 'intro', title: 'Intro recap', meta: 'Completed', state: 'completed' },
      { id: 'patterns', title: 'Rendering Patterns', meta: '12 min lesson', state: 'current' },
      {
        id: 'server-components',
        title: 'Server Components Deep Dive',
        meta: '24 min lesson',
        state: 'upcoming',
      },
      { id: 'shell', title: 'Build dashboard shell', meta: 'Project task', state: 'upcoming' },
      {
        id: 'data-flow',
        title: 'Refactor data-fetching flow',
        meta: 'Project task',
        state: 'upcoming',
      },
      { id: 'review', title: 'Deployment review', meta: 'Upcoming', state: 'upcoming' },
    ],
  },
};

export function getMockWorkspace(id?: string): CourseWorkspace {
  if (id && mockWorkspaces[id]) return mockWorkspaces[id];

  const course = mockCourses.find((item) => item.id === id) ?? mockCourses[0];
  return {
    ...course,
    milestones: mockWorkspaces['nextjs-advanced'].milestones,
  };
}
