import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ProgressBar';
import { useProductivity } from '@/contexts/ProductivityContext';
import { useTabActions } from '@/contexts/TabActionsContext';
import type { CourseStatus } from '@/types/database';
import { getProgressPercentage } from '@/utils/time';

const filters: { label: string; value: CourseStatus }[] = [
  { label: 'In progress', value: 'in_progress' },
  { label: 'Backlog', value: 'backlog' },
  { label: 'Completed', value: 'completed' },
];

export default function ShelfScreen() {
  const { courses, isLoading, error, refresh } = useProductivity();
  const { openAddCourse } = useTabActions();
  const [filter, setFilter] = useState<CourseStatus>('in_progress');
  const visibleCourses = useMemo(
    () => courses.filter((course) => course.status === filter),
    [courses, filter],
  );

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['top']}>
      <ScrollView contentContainerClassName="px-6 pb-32 pt-8" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-bold tracking-[3px] text-accent">LEARNING LIBRARY</Text>
            <Text className="mt-3 text-4xl font-extrabold tracking-tight text-cream">Your shelf.</Text>
            <Text className="mt-2 text-base text-muted">Keep only what deserves your attention.</Text>
          </View>
          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-accent active:opacity-70" onPress={openAddCourse}>
            <Text className="text-3xl font-light text-black">+</Text>
          </Pressable>
        </View>

        <ScrollView className="-mx-6 mt-8" contentContainerClassName="gap-3 px-6" horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((item) => (
            <Pressable
              className={`rounded-full px-5 py-3 ${filter === item.value ? 'bg-accent' : 'bg-surface'}`}
              key={item.value}
              onPress={() => setFilter(item.value)}
            >
              <Text className={`text-sm font-semibold ${filter === item.value ? 'text-black' : 'text-muted'}`}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {error ? (
          <Pressable className="mt-6 rounded-2xl bg-red-500/10 p-4" onPress={() => void refresh()}>
            <Text className="font-bold text-red-400">Couldn’t load your shelf. Tap to retry.</Text>
          </Pressable>
        ) : null}

        <View className="mt-8 gap-4">
          {visibleCourses.map((course) => {
            const progress = getProgressPercentage(course.current_progress_sec, course.total_duration_sec);
            return (
              <Pressable
                className="rounded-[28px] bg-surface p-6 active:bg-elevated"
                key={course.id}
                onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
              >
                <View className="flex-row items-start justify-between">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#382600]">
                    <Text className="text-lg font-black text-accent">{course.platform.slice(0, 1)}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-muted">{course.platform}</Text>
                </View>
                <Text className="mt-6 text-2xl font-bold leading-7 text-cream">{course.title}</Text>
                <View className="mb-4 mt-7 flex-row justify-between">
                  <Text className="text-sm text-muted">Progress</Text>
                  <Text className="text-sm font-bold text-accent">{progress}%</Text>
                </View>
                <ProgressBar progress={progress} />
              </Pressable>
            );
          })}
        </View>

        {!isLoading && visibleCourses.length === 0 ? (
          <View className="mt-8 items-start rounded-[28px] bg-surface p-7">
            <Text className="text-3xl text-accent">◇</Text>
            <Text className="mt-5 text-xl font-bold text-cream">Nothing here yet.</Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              {filter === 'in_progress' ? 'Add one learning path worth finishing this season.' : `Courses marked ${filter.replace('_', ' ')} will collect here.`}
            </Text>
            {filter === 'in_progress' ? (
              <Pressable className="mt-6 rounded-full bg-accent px-5 py-3" onPress={openAddCourse}>
                <Text className="font-bold text-black">Add your first course</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
