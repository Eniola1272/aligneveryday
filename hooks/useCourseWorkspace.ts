import { useMemo } from 'react';

import { useProductivity } from '@/contexts/ProductivityContext';
import type { CourseMilestone, CourseWorkspace } from '@/types/learning';

const unavailableCourse: CourseWorkspace = {
  id: 'unavailable',
  user_id: '',
  title: 'Course unavailable',
  platform: 'Custom',
  source_url: null,
  total_duration_sec: 0,
  current_progress_sec: 0,
  status: 'backlog',
  milestones: [
    { id: 'unavailable', title: 'Return to your shelf', meta: 'This learning path could not be found.', state: 'upcoming' },
  ],
};

export function useCourseWorkspace(courseId?: string) {
  const workspace = useProductivity();

  const courseWorkspace = useMemo<CourseWorkspace>(() => {
    const course = workspace.courses.find((item) => item.id === courseId);
    if (!course) return unavailableCourse;

    const linkedTodos = workspace.todos.filter((todo) => todo.course_id === course.id);
    let currentAssigned = false;
    const milestones: CourseMilestone[] = linkedTodos.map((todo) => {
      let state: CourseMilestone['state'] = 'upcoming';
      if (todo.is_completed) state = 'completed';
      else if (!currentAssigned) {
        state = 'current';
        currentAssigned = true;
      }
      return {
        id: todo.id,
        title: todo.task_title,
        meta: todo.is_completed ? 'Alignment completed' : 'Project alignment',
        state,
      };
    });

    if (milestones.length === 0) {
      milestones.push(
        { id: 'begin', title: 'Begin the learning path', meta: 'Current focus', state: 'current' },
        { id: 'align', title: 'Create your first alignment', meta: 'Turn learning into action', state: 'upcoming' },
      );
    }

    return { ...course, milestones };
  }, [courseId, workspace.courses, workspace.todos]);

  return {
    workspace: courseWorkspace,
    isLoading: workspace.isLoading,
    isMockData: false,
    updateProgress: workspace.updateCourseProgress,
    updateStatus: workspace.updateCourseStatus,
    updateCourse: workspace.updateCourse,
  };
}
