import { Pressable, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import type { Course } from '@/types/database';
import { getProgressPercentage } from '@/utils/time';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

const platformGlyph: Record<Course['platform'], string> = {
  YouTube: 'N',
  Udemy: '✦',
  Coursera: 'C',
  Custom: 'A',
};

export function CourseCard({ course, onPress }: CourseCardProps) {
  const progress = getProgressPercentage(
    course.current_progress_sec,
    course.total_duration_sec,
  );

  return (
    <Pressable
      accessibilityHint="Opens the course workspace"
      accessibilityRole="button"
      className="mr-4 h-64 w-72 justify-between rounded-[28px] bg-surface p-6 active:bg-elevated"
      onPress={onPress}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#382600]">
        <Text className="text-xl font-semibold text-accent">{platformGlyph[course.platform]}</Text>
      </View>

      <Text className="mt-5 text-2xl font-bold leading-7 tracking-tight text-cream" numberOfLines={2}>
        {course.title}
      </Text>

      <View>
        <View className="mb-5 flex-row items-baseline">
          <Text className="text-xl font-bold text-accent">{progress}%</Text>
          <Text className="ml-1 text-base text-muted">Completed</Text>
        </View>
        <ProgressBar progress={progress} />
      </View>
    </Pressable>
  );
}
