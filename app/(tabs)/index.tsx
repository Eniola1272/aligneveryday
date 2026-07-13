import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddTodoModal } from "@/components/AddTodoModal";
import { CourseCard } from "@/components/CourseCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useProductivity } from "@/contexts/ProductivityContext";
import { useTabActions } from "@/contexts/TabActionsContext";
import { useDailyStreak } from "@/hooks/useDailyStreak";
import { useDashboardData } from "@/hooks/useDashboardData";
import type { DashboardTodo } from "@/types/learning";
import { formatTaskDate, isPastDue } from "@/utils/date";

function formatDashboardDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function AlignmentRow({
  todo,
  onToggle,
  onEdit,
}: {
  todo: DashboardTodo;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const isOverdue = !todo.is_completed && isPastDue(todo.due_date);

  function openLinkedCourse() {
    if (!todo.course_id) return;
    router.push({ pathname: "/course/[id]", params: { id: todo.course_id } });
  }

  return (
    <Pressable
      accessibilityHint="Opens this alignment for editing"
      className={`mb-2 min-h-20 flex-row items-center rounded-2xl px-4 py-3 active:bg-elevated ${
        isOverdue ? "bg-red-950/20" : "bg-surface"
      }`}
      onPress={onEdit}
    >
      <Pressable
        accessibilityLabel={`${todo.task_title}: ${
          todo.is_completed ? "Mark incomplete" : "Mark complete"
        }`}
        className={`mr-4 h-9 w-9 items-center justify-center rounded-full ${
          todo.is_completed
            ? "bg-accent"
            : isOverdue
              ? "border-2 border-red-400"
              : "border-2 border-zinc-600"
        }`}
        onPress={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        {todo.is_completed ? (
          <Text className="font-black text-black">✓</Text>
        ) : null}
      </Pressable>
      {todo.courseLabel ? (
        <View className="mr-4 rounded-lg bg-elevated px-3 py-2">
          <Text className="text-sm font-semibold text-accent">
            {todo.courseLabel}
          </Text>
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        {isOverdue ? (
          <Text className="mb-1 text-xs font-bold uppercase tracking-[1.5px] text-red-400">
            Overdue · due {formatTaskDate(todo.due_date)}
          </Text>
        ) : null}
        <Text
          className={`text-base font-medium leading-6 ${
            todo.is_completed ? "text-zinc-500 line-through" : "text-cream"
          }`}
        >
          {todo.task_title}
        </Text>
      </View>
      {todo.course_id ? (
        <Pressable
          accessibilityLabel="Open linked course"
          className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-elevated"
          onPress={(event) => {
            event.stopPropagation();
            openLinkedCourse();
          }}
        >
          <Text className="text-2xl leading-6 text-accent">›</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { courses, todos, isLoading, error, refresh } = useDashboardData();
  const {
    courses: allCourses,
    todos: allTodos,
    addTodo,
    updateTodo,
    toggleTodo,
  } = useProductivity();
  const { openAddCourse } = useTabActions();
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<DashboardTodo | null>(null);
  const firstName = profile?.full_name?.split(" ")[0];
  const streak = useDailyStreak(allTodos);
  const overdueCount = todos.filter(
    (todo) => !todo.is_completed && isPastDue(todo.due_date),
  ).length;
  const streakLabel =
    streak.count > 0 ? `${streak.count} Day Streak` : "Start Streak";
  const streakHint =
    streak.state === "at_risk"
      ? "Complete one alignment today to keep it."
      : null;

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
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
                {firstName ? `Align, ${firstName}.` : "Align Everyday."}
              </Text>
            </View>
            <View className="absolute right-0 top-1 flex-row items-center rounded-full bg-surface px-3 py-2">
              <Text className="mr-1.5 text-xl text-accent">♨</Text>
              {streak.count > 0 ? (
                <Text className="text-sm font-bold text-accent">
                  {streak.count}
                </Text>
              ) : null}
              <Text
                className={`${streak.count > 0 ? "ml-1" : ""} text-sm text-cream`}
              >
                {streak.count > 0 ? "Day Streak" : streakLabel}
              </Text>
            </View>
          </View>
          <Text className="mt-6 text-lg text-muted">
            {formatDashboardDate(new Date())}
          </Text>
          {streakHint ? (
            <View className="mt-4 rounded-2xl bg-[#2C210D] px-4 py-3">
              <Text className="text-sm font-semibold text-accent">
                Streak at risk
              </Text>
              <Text className="mt-1 text-sm text-zinc-300">{streakHint}</Text>
            </View>
          ) : null}
          {overdueCount > 0 ? (
            <Pressable
              className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3"
              onPress={() => router.push("/alignments")}
            >
              <Text className="text-sm font-bold text-red-400">
                {overdueCount} overdue{" "}
                {overdueCount === 1 ? "alignment" : "alignments"}
              </Text>
              <Text className="mt-1 text-sm text-zinc-300">
                Reschedule or finish them to clean up today.
              </Text>
            </Pressable>
          ) : null}
          {error ? (
            <Pressable
              className="mt-6 rounded-2xl bg-red-500/10 p-4"
              onPress={() => void refresh()}
            >
              <Text className="font-bold text-red-400">
                Something didn’t sync.
              </Text>
              <Text className="mt-1 text-sm text-zinc-300">
                {error} Tap to refresh your workspace.
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mb-14">
          <View className="px-6">
            <SectionHeader
              actionLabel="See all"
              onPress={() => router.push("/shelf")}
              subtitle="Keep momentum on what matters."
              title="Focus Shelf"
            />
          </View>
          {isLoading ? (
            <ActivityIndicator className="py-16" color="#FF9D00" />
          ) : null}
          {!isLoading && courses.length > 0 ? (
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
                    router.push({
                      pathname: "/course/[id]",
                      params: { id: course.id },
                    })
                  }
                />
              ))}
            </ScrollView>
          ) : null}
          {!isLoading && courses.length === 0 ? (
            <Pressable
              className="mx-6 rounded-[28px] bg-surface p-7 active:bg-elevated"
              onPress={openAddCourse}
            >
              <Text className="text-3xl text-accent">＋</Text>
              <Text className="mt-4 text-xl font-bold text-cream">
                Choose one thing worth finishing.
              </Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Add a course, video series, or manual learning path to begin.
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View className="px-6">
          <SectionHeader
            actionLabel="View all"
            onPress={() => router.push("/alignments")}
            subtitle="Small actions. Big results."
            title="Today’s Alignments"
          />
          <View>
            {todos.slice(0, 5).map((todo) => (
              <AlignmentRow
                key={todo.id}
                onEdit={() => {
                  setEditingTodo(todo);
                  setIsTodoModalOpen(true);
                }}
                onToggle={() => void toggleTodo(todo.id).catch(() => undefined)}
                todo={todo}
              />
            ))}
          </View>
          {todos.length === 0 ? (
            <Pressable
              className="rounded-[28px] bg-surface p-7"
              onPress={() => setIsTodoModalOpen(true)}
            >
              <Text className="text-2xl text-accent">✓</Text>
              <Text className="mt-4 text-xl font-bold text-cream">
                Your day has room.
              </Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Define one specific action that would make today count.
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            className="mt-4 items-center rounded-2xl bg-elevated py-4"
            onPress={() => setIsTodoModalOpen(true)}
          >
            <Text className="font-bold text-accent">+ Add an alignment</Text>
          </Pressable>
        </View>
      </ScrollView>
      <AddTodoModal
        courses={allCourses}
        onAdd={addTodo}
        onClose={() => {
          setIsTodoModalOpen(false);
          setEditingTodo(null);
        }}
        onUpdate={updateTodo}
        todo={editingTodo}
        visible={isTodoModalOpen}
      />
    </SafeAreaView>
  );
}
