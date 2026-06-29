import { useProductivity } from '@/contexts/ProductivityContext';

export function useDashboardData() {
  const workspace = useProductivity();
  const today = new Date().toDateString();
  return {
    ...workspace,
    courses: workspace.courses.filter((course) => course.status === 'in_progress'),
    todos: workspace.todos.filter(
      (todo) =>
        !todo.is_completed &&
        (!todo.due_date || new Date(todo.due_date).toDateString() === today),
    ),
    isMockData: false,
  };
}
