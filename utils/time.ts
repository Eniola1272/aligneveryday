export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function getProgressPercentage(current: number, total: number): number {
  if (total <= 0) return 0;
  return clampPercentage(Math.round((current / total) * 100));
}

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, '0'))
    .join(':');
}

export function formatRemainingTime(totalSeconds: number): string {
  const formatted = formatDuration(totalSeconds);
  return totalSeconds < 3600 ? formatted.slice(3) : formatted;
}
