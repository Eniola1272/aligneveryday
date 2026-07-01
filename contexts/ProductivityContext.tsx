import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mockCourses, mockTodos } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import type { Course, CourseStatus, Todo } from '@/types/database';
import type { AddShelfDraft, DashboardTodo, TodoDraft } from '@/types/learning';
import { useAuth } from '@/contexts/AuthContext';

interface ProductivityContextValue {
  courses: Course[];
  todos: DashboardTodo[];
  isLoading: boolean;
  error: string | null;
  addCourse: (draft: AddShelfDraft) => Promise<Course>;
  updateCourse: (courseId: string, draft: AddShelfDraft) => Promise<void>;
  addTodo: (input: TodoDraft) => Promise<Todo>;
  updateTodo: (todoId: string, input: TodoDraft) => Promise<void>;
  toggleTodo: (todoId: string) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  updateCourseProgress: (courseId: string, seconds: number) => Promise<void>;
  updateCourseStatus: (courseId: string, status: CourseStatus) => Promise<void>;
  refresh: () => Promise<void>;
}

const ProductivityContext = createContext<ProductivityContextValue | null>(null);

function withCourseLabels(courses: Course[], todos: Todo[]): DashboardTodo[] {
  const labels = new Map(
    courses.map((course) => [course.id, course.title.split(' ').slice(0, 3).join(' ')]),
  );
  return todos.map((todo) => ({
    ...todo,
    courseLabel: todo.course_id ? (labels.get(todo.course_id) ?? 'Course') : null,
  }));
}

export function ProductivityProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isDemo, userId } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [todos, setTodos] = useState<DashboardTodo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function hydrate() {
    if (!isAuthenticated || !userId) {
      setCourses([]);
      setTodos([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    if (isDemo || !supabase) {
      setIsLoading(false);
      setCourses(mockCourses);
      setTodos(mockTodos);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const [coursesResult, todosResult] = await Promise.all([
      supabase.from('courses').select('*').eq('user_id', userId).order('title'),
      supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order')
        .order('due_date'),
    ]);
    setIsLoading(false);

    if (coursesResult.error || todosResult.error) {
      setError(coursesResult.error?.message ?? todosResult.error?.message ?? 'Unable to load workspace.');
      return;
    }

    const nextCourses = coursesResult.data ?? [];
    setCourses(nextCourses);
    setTodos(withCourseLabels(nextCourses, todosResult.data ?? []));
  }

  useEffect(() => {
    void hydrate();
  }, [isAuthenticated, isDemo, userId]);

  const value = useMemo<ProductivityContextValue>(
    () => ({
      courses,
      todos,
      isLoading,
      error,
      async addCourse(draft) {
        if (!userId) throw new Error('Sign in to add a course.');
        const courseInput = {
          user_id: userId,
          title: draft.title.trim(),
          platform: draft.platform,
          source_url: draft.sourceUrl.trim() || null,
          total_duration_sec: draft.hours * 3600 + draft.minutes * 60,
          current_progress_sec: 0,
          status: draft.status,
        };

        if (isDemo || !supabase) {
          const course: Course = { id: `demo-course-${Date.now()}`, ...courseInput };
          setCourses((current) => [course, ...current]);
          return course;
        }

        const { data, error: mutationError } = await supabase
          .from('courses')
          .insert(courseInput)
          .select('*')
          .single();
        if (mutationError) throw new Error(mutationError.message);
        setCourses((current) => [data, ...current]);
        return data;
      },
      async updateCourse(courseId, draft) {
        const target = courses.find((course) => course.id === courseId);
        if (!target) throw new Error('That course could not be found.');
        const updates = {
          title: draft.title.trim(),
          platform: draft.platform,
          source_url: draft.sourceUrl.trim() || null,
          total_duration_sec: draft.hours * 3600 + draft.minutes * 60,
          current_progress_sec: Math.min(
            target.current_progress_sec,
            draft.hours * 3600 + draft.minutes * 60,
          ),
          status: draft.status,
        };
        const previous = courses;
        setCourses((current) =>
          current.map((course) => (course.id === courseId ? { ...course, ...updates } : course)),
        );
        setTodos((current) => withCourseLabels(
          courses.map((course) => (course.id === courseId ? { ...course, ...updates } : course)),
          current,
        ));
        if (!isDemo && supabase) {
          const { error: mutationError } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId);
          if (mutationError) {
            setCourses(previous);
            setTodos((current) => withCourseLabels(previous, current));
            throw new Error(mutationError.message);
          }
        }
      },
      async addTodo(input) {
        if (!userId) throw new Error('Sign in to add an alignment.');
        const todoInput = {
          user_id: userId,
          course_id: input.courseId,
          task_title: input.title.trim(),
          is_completed: false,
          due_date: input.dueDate,
          completed_at: null,
          sort_order: Math.max(0, ...todos.map((todo) => todo.sort_order)) + 1000,
        };

        let todo: Todo;
        if (isDemo || !supabase) {
          todo = { id: `demo-todo-${Date.now()}`, ...todoInput };
        } else {
          const { data, error: mutationError } = await supabase
            .from('todos')
            .insert(todoInput)
            .select('*')
            .single();
          if (mutationError) throw new Error(mutationError.message);
          todo = data;
        }
        setTodos((current) => withCourseLabels(courses, [todo, ...current]));
        return todo;
      },
      async updateTodo(todoId, input) {
        const target = todos.find((todo) => todo.id === todoId);
        if (!target) throw new Error('That alignment could not be found.');
        const updates = {
          task_title: input.title.trim(),
          course_id: input.courseId,
          due_date: input.dueDate,
        };
        setTodos((current) =>
          withCourseLabels(
            courses,
            current.map((todo) => (todo.id === todoId ? { ...todo, ...updates } : todo)),
          ),
        );
        if (!isDemo && supabase) {
          const { error: mutationError } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', todoId);
          if (mutationError) {
            setTodos((current) =>
              withCourseLabels(
                courses,
                current.map((todo) => (todo.id === todoId ? target : todo)),
              ),
            );
            throw new Error(mutationError.message);
          }
        }
      },
      async toggleTodo(todoId) {
        const target = todos.find((todo) => todo.id === todoId);
        if (!target) return;
        const nextCompleted = !target.is_completed;
        const nextCompletedAt = nextCompleted ? new Date().toISOString() : null;
        setTodos((current) =>
          current.map((todo) =>
            todo.id === todoId
              ? { ...todo, is_completed: nextCompleted, completed_at: nextCompletedAt }
              : todo,
          ),
        );
        if (!isDemo && supabase) {
          const { error: mutationError } = await supabase
            .from('todos')
            .update({ is_completed: nextCompleted, completed_at: nextCompletedAt })
            .eq('id', todoId);
          if (mutationError) {
            setTodos((current) =>
              current.map((todo) =>
                todo.id === todoId
                  ? {
                      ...todo,
                      is_completed: target.is_completed,
                      completed_at: target.completed_at,
                    }
                  : todo,
              ),
            );
            throw new Error(mutationError.message);
          }
        }
      },
      async deleteTodo(todoId) {
        const previous = todos;
        setTodos((current) => current.filter((todo) => todo.id !== todoId));
        if (!isDemo && supabase) {
          const { error: mutationError } = await supabase.from('todos').delete().eq('id', todoId);
          if (mutationError) {
            setTodos(previous);
            throw new Error(mutationError.message);
          }
        }
      },
      async updateCourseProgress(courseId, seconds) {
        const target = courses.find((course) => course.id === courseId);
        if (!target) return;
        const safeSeconds = Math.min(target.total_duration_sec, Math.max(0, Math.round(seconds)));
        setCourses((current) =>
          current.map((course) =>
            course.id === courseId ? { ...course, current_progress_sec: safeSeconds } : course,
          ),
        );
        if (!isDemo && supabase) {
          const { error: mutationError } = await supabase
            .from('courses')
            .update({ current_progress_sec: safeSeconds })
            .eq('id', courseId);
          if (mutationError) throw new Error(mutationError.message);
        }
      },
      async updateCourseStatus(courseId, status) {
        setCourses((current) =>
          current.map((course) => (course.id === courseId ? { ...course, status } : course)),
        );
        if (!isDemo && supabase) {
          const { error: mutationError } = await supabase
            .from('courses')
            .update({ status })
            .eq('id', courseId);
          if (mutationError) throw new Error(mutationError.message);
        }
      },
      refresh: hydrate,
    }),
    [courses, error, isDemo, isLoading, todos, userId],
  );

  return <ProductivityContext.Provider value={value}>{children}</ProductivityContext.Provider>;
}

export function useProductivity(): ProductivityContextValue {
  const context = useContext(ProductivityContext);
  if (!context) throw new Error('useProductivity must be used inside ProductivityProvider.');
  return context;
}
