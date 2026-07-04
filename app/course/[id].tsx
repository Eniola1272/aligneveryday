import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddShelfModal from "@/app/components/AddShelfModal";
import { ProgressScrubber } from "@/components/ProgressScrubber";
import { useCourseWorkspace } from "@/hooks/useCourseWorkspace";
import type { CourseMilestone } from "@/types/learning";
import {
  formatDuration,
  formatRemainingTime,
  getProgressPercentage,
} from "@/utils/time";

function TimelineMarker({
  milestone,
  isLast,
}: {
  milestone: CourseMilestone;
  isLast: boolean;
}) {
  const isCompleted = milestone.state === "completed";
  const isCurrent = milestone.state === "current";

  return (
    <View className="w-16 items-center self-stretch">
      <View
        className={`z-10 h-12 w-12 items-center justify-center rounded-full ${
          isCompleted
            ? "bg-accent"
            : isCurrent
              ? "border-4 border-accent bg-ink"
              : "border-[3px] border-zinc-600 bg-ink"
        }`}
      >
        {isCompleted ? (
          <Text className="text-2xl font-bold text-black">✓</Text>
        ) : null}
      </View>
      {!isLast ? (
        <View
          className={`w-0.5 flex-1 ${isCompleted ? "bg-accent" : "bg-zinc-700"}`}
        />
      ) : null}
    </View>
  );
}

export default function CourseWorkspaceScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    workspace: course,
    updateProgress,
    updateStatus,
    updateCourse,
  } = useCourseWorkspace(courseId);
  const persistedProgress = getProgressPercentage(
    course.current_progress_sec,
    course.total_duration_sec,
  );
  const [progress, setProgress] = useState(persistedProgress);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => setProgress(persistedProgress), [persistedProgress]);

  const displayedProgressSeconds = Math.round(
    (progress / 100) * course.total_duration_sec,
  );
  const remaining = Math.max(
    0,
    course.total_duration_sec - displayedProgressSeconds,
  );

  async function resumeCourse() {
    const saved = await saveProgress();
    if (!saved) return;
    if (course.source_url) {
      try {
        await Linking.openURL(course.source_url);
      } catch {
        setFeedback("That learning link could not be opened.");
      }
    }
  }

  async function saveProgress() {
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateProgress(course.id, displayedProgressSeconds);
      if (course.status === "backlog" && displayedProgressSeconds > 0) {
        await updateStatus(course.id, "in_progress");
      }
      setFeedback("Progress saved");
      return true;
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Could not save progress.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function completeCourse() {
    setIsSaving(true);
    try {
      await updateProgress(course.id, course.total_duration_sec);
      await updateStatus(course.id, "completed");
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-36 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="-ml-2 mr-3 h-12 w-12 items-center justify-center rounded-full active:bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-4xl font-light leading-10 text-cream">‹</Text>
          </Pressable>
          <Text
            className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-cream"
            numberOfLines={2}
          >
            {course.title}
          </Text>
          {course.id !== "unavailable" ? (
            <Pressable
              accessibilityLabel="Edit course"
              className="ml-3 rounded-full bg-surface px-4 py-2.5"
              onPress={() => setIsEditOpen(true)}
            >
              <Text className="text-sm font-bold text-accent">Edit</Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-14">
          <View className="mb-7 flex-row items-end justify-between">
            <Text className="text-4xl font-extrabold tracking-tight text-accent">
              {formatDuration(displayedProgressSeconds)}
            </Text>
            <Text className="pb-1 text-base text-muted">
              {formatRemainingTime(remaining)} remaining
            </Text>
          </View>
          <ProgressScrubber
            onProgressChange={setProgress}
            progress={progress}
          />
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-sm text-muted">
              Drag to update your learning time.
            </Text>
            <Pressable
              className="rounded-full bg-surface px-4 py-2"
              disabled={isSaving}
              onPress={() => void saveProgress()}
            >
              <Text className="text-sm font-bold text-accent">
                {isSaving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          </View>
          {feedback ? (
            <Text className="mt-3 text-sm text-accent">{feedback}</Text>
          ) : null}
        </View>

        <View className="mt-16">
          {course.milestones.map((milestone, index) => (
            <View className="min-h-28 flex-row" key={milestone.id}>
              <TimelineMarker
                isLast={index === course.milestones.length - 1}
                milestone={milestone}
              />
              <View className="min-w-0 flex-1 pb-8 pl-4 pt-1">
                <Text className="text-xl font-bold leading-7 text-cream">
                  {milestone.title}
                </Text>
                <Text
                  className={`mt-2 text-base ${
                    milestone.state === "current"
                      ? "text-zinc-400"
                      : "text-muted"
                  }`}
                >
                  {milestone.meta}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Pressable
          className="mt-2 items-center rounded-2xl bg-surface px-5 py-4"
          disabled={isSaving}
          onPress={() => void completeCourse()}
        >
          <Text className="font-bold text-cream">Mark course complete</Text>
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-ink px-6 pb-4 pt-3">
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-2xl bg-accent px-6 py-5 active:bg-orange-400"
          disabled={isSaving}
          onPress={resumeCourse}
        >
          <Text className="text-lg font-bold text-black">
            {isSaving
              ? "Saving progress…"
              : course.source_url
                ? `Resume Learning on ${course.platform}`
                : "Save learning progress"}
          </Text>
        </Pressable>
      </View>
      <AddShelfModal
        course={course.id === "unavailable" ? null : course}
        onClose={() => setIsEditOpen(false)}
        onUpdate={updateCourse}
        visible={isEditOpen && course.id !== "unavailable"}
      />
    </SafeAreaView>
  );
}
