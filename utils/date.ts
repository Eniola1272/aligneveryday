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

export function isBeforeToday(value: string | null, reference = new Date()): boolean {
  if (!value) return false;
  const startOfToday = new Date(reference);
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(value).getTime() < startOfToday.getTime();
}

export function startOfLocalDayIso(date: Date): string {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
}

export function endOfLocalDayIso(date: Date): string {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value.toISOString();
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'No schedule';
  if (start && !end) return `${formatTaskDate(start)} → choose end`;
  if (!start && end) return `Choose start → ${formatTaskDate(end)}`;
  const startLabel = formatTaskDate(start);
  const endLabel = formatTaskDate(end);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

export function formatTaskDate(value: string | null): string {
  if (!value) return 'No deadline';
  if (isSameLocalDay(value)) return 'Today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(value, tomorrow)) return 'Tomorrow';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
