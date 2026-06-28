import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CourseCard } from '@/components/CourseCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { DashboardTodo } from '@/types/learning';

function formatDashboardDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function AlignmentRow({ todo }: { todo: DashboardTodo }) {
  function openLinkedCourse() {
    if (!todo.course_id) return;
    router.push({ pathname: '/course/[id]', params: { id: todo.course_id } });
  }

  return (
    <Pressable
      accessibilityHint={todo.course_id ? 'Opens the linked course' : undefined}
      accessibilityRole="button"
      className="mb-2 min-h-20 flex-row items-center rounded-2xl bg-surface px-4 py-3 active:bg-elevated"
      onPress={openLinkedCourse}
    >
      <View className="mr-4 h-2.5 w-2.5 rounded-full bg-accent" />
      {todo.courseLabel ? (
        <View className="mr-4 rounded-lg bg-elevated px-3 py-2">
          <Text className="text-sm font-semibold text-accent">{todo.courseLabel}</Text>
        </View>
      ) : null}
      <Text className="min-w-0 flex-1 text-base font-medium leading-6 text-cream">
        {todo.task_title}
      </Text>
      <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-elevated">
        <Text className="text-2xl leading-6 text-accent">›</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { courses, todos } = useDashboardData();

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-12 pt-9">
          <View className="relative">
            <View>
              <Text className="pr-36 text-[42px] font-extrabold leading-[46px] tracking-tight text-accent">
                Today,
              </Text>
              <Text className="text-[42px] font-extrabold leading-[46px] tracking-tight text-cream">
                Align Everyday.
              </Text>
            </View>
            <View className="absolute right-0 top-1 flex-row items-center rounded-full bg-surface px-3 py-2">
              <Text className="mr-1.5 text-xl text-accent">♨</Text>
              <Text className="text-sm font-bold text-accent">5</Text>
              <Text className="ml-1 text-sm text-cream">Day Streak</Text>
            </View>
          </View>
          <Text className="mt-6 text-lg text-muted">{formatDashboardDate(new Date())}</Text>
        </View>

        <View className="mb-14">
          <View className="px-6">
            <SectionHeader
              actionLabel="See all"
              subtitle="Keep momentum on what matters."
              title="Focus Shelf"
            />
          </View>
          <ScrollView
            contentContainerClassName="pl-6 pr-2"
            decelerationRate="fast"
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {courses.map((course) => (
              <CourseCard
                course={course}
                key={course.id}
                onPress={() =>
                  router.push({ pathname: '/course/[id]', params: { id: course.id } })
                }
              />
            ))}
          </ScrollView>
        </View>

        <View className="px-6">
          <SectionHeader
            actionLabel="View all"
            subtitle="Small actions. Big results."
            title="Today’s Alignments"
          />
          <View>
            {todos.map((todo) => (
              <AlignmentRow key={todo.id} todo={todo} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
