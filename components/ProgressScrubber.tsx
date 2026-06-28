import { useState } from 'react';
import {
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  View,
} from 'react-native';

import { clampPercentage } from '@/utils/time';

interface ProgressScrubberProps {
  progress: number;
  onProgressChange: (progress: number) => void;
}

export function ProgressScrubber({
  progress,
  onProgressChange,
}: ProgressScrubberProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const safeProgress = clampPercentage(progress);

  function updateFromTouch(event: GestureResponderEvent) {
    if (trackWidth <= 0) return;
    onProgressChange(clampPercentage((event.nativeEvent.locationX / trackWidth) * 100));
  }

  function handleAccessibilityAction(event: AccessibilityActionEvent) {
    const delta = event.nativeEvent.actionName === 'increment' ? 5 : -5;
    onProgressChange(clampPercentage(safeProgress + delta));
  }

  return (
    <View
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      accessibilityLabel="Course progress"
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(safeProgress) }}
      className="relative h-16 w-full overflow-hidden rounded-full bg-elevated"
      onAccessibilityAction={handleAccessibilityAction}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={updateFromTouch}
      onResponderMove={updateFromTouch}
      onStartShouldSetResponder={() => true}
    >
      <View
        className="absolute bottom-0 left-0 top-0 overflow-hidden rounded-full bg-accent"
        style={{ width: `${safeProgress}%` }}
      >
        <View className="absolute -left-3 top-1 h-12 w-24 rounded-full bg-orange-400 opacity-50" />
        <View className="absolute -right-6 bottom-1 h-11 w-24 rounded-full bg-yellow-400 opacity-40" />
      </View>
      <View
        className="absolute top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-accent bg-elevated"
        style={{ left: `${safeProgress}%` }}
      />
    </View>
  );
}
