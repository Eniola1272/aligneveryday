import { View } from "react-native";

import { clampPercentage } from "@/utils/time";

interface ProgressBarProps {
  progress: number;
  size?: "compact" | "large";
  showHandle?: boolean;
}

export function ProgressBar({
  progress,
  size = "compact",
  showHandle = false,
}: ProgressBarProps) {
  const safeProgress = clampPercentage(progress);
  const trackClassName = size === "large" ? "h-16" : "h-2";

  return (
    <View
      accessibilityLabel={`${safeProgress}% complete`}
      accessibilityRole="progressbar"
      className={`relative w-full overflow-hidden rounded-full bg-elevated ${trackClassName}`}
    >
      <View
        className="absolute bottom-0 left-0 top-0 rounded-full bg-accent"
        style={{ width: `${safeProgress}%` }}
      >
        {size === "large" ? (
          <>
            <View className="absolute -left-3 top-1 h-12 w-24 rounded-full bg-orange-400 opacity-50" />
            <View className="absolute -right-6 bottom-1 h-11 w-24 rounded-full bg-yellow-400 opacity-40" />
          </>
        ) : null}
      </View>
      {showHandle ? (
        <View
          className="absolute top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-accent bg-elevated"
          style={{ left: `${safeProgress}%` }}
        />
      ) : null}
    </View>
  );
}
