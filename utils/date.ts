export function isSameLocalDay(value: string | null, reference = new Date()): boolean {
  if (!value) return false;
  const date = new Date(value);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function isAfterToday(value: string | null, reference = new Date()): boolean {
  if (!value) return false;
  const endOfToday = new Date(reference);
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(value).getTime() > endOfToday.getTime();
}

export function formatTaskDate(value: string | null): string {
  if (!value) return 'No deadline';
  if (isSameLocalDay(value)) return 'Today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(value, tomorrow)) return 'Tomorrow';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
