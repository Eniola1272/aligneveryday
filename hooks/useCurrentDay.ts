import { useEffect, useState } from "react";

export function useCurrentDay(): string {
  const [day, setDay] = useState(() => new Date().toDateString());

  useEffect(() => {
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 50);
    const timeout = setTimeout(
      () => setDay(new Date().toDateString()),
      nextMidnight.getTime() - Date.now(),
    );
    return () => clearTimeout(timeout);
  }, [day]);

  return day;
}
