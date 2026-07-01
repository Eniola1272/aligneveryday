import { useProductivity } from '@/contexts/ProductivityContext';
import { useCurrentDay } from '@/hooks/useCurrentDay';
import { isAfterToday, isSameLocalDay } from '@/utils/date';

export function useDashboardData() {
  const workspace = useProductivity();
  useCurrentDay();
  return {
    ...workspace,
    courses: workspace.courses.filter((course) => course.status === 'in_progress'),
    todos: workspace.todos.filter((todo) =>
      todo.is_completed
        ? isSameLocalDay(todo.completed_at)
        : !(todo.start_date ?? todo.due_date) ||
          !isAfterToday(todo.start_date ?? todo.due_date),
    ),
    isMockData: false,
  };
}
