import { useEffect, useState } from 'react';

import { mockCourses, mockTodos } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/types/database';
import type { DashboardTodo } from '@/types/learning';

interface DashboardData {
  courses: Course[];
  todos: DashboardTodo[];
  isLoading: boolean;
  isMockData: boolean;
}

export function useDashboardData(userId?: string): DashboardData {
  const [data, setData] = useState<DashboardData>({
    courses: mockCourses,
    todos: mockTodos,
    isLoading: Boolean(userId && supabase),
    isMockData: true,
  });

  useEffect(() => {
    if (!userId || !supabase) return;

    let isMounted = true;

    async function hydrateDashboard() {
      const [coursesResult, todosResult] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .order('title'),
        supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .eq('is_completed', false)
          .order('due_date'),
      ]);

      if (!isMounted) return;

      if (coursesResult.error || todosResult.error) {
        setData((current) => ({ ...current, isLoading: false }));
        return;
      }

      const courses = coursesResult.data ?? [];
      const courseLabels = new Map(
        courses.map((course) => [course.id, course.title.split(' ').slice(0, 2).join(' ')]),
      );
      const todos: DashboardTodo[] = (todosResult.data ?? []).map((todo) => ({
        ...todo,
        courseLabel: todo.course_id ? (courseLabels.get(todo.course_id) ?? 'Course') : null,
      }));

      setData({ courses, todos, isLoading: false, isMockData: false });
    }

    void hydrateDashboard();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return data;
}
