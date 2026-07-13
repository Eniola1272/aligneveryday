import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddShelfModal from "@/app/components/AddShelfModal";
import { ProgressScrubber } from "@/components/ProgressScrubber";
import {
  buildCourseProgressMilestones,
  useCourseWorkspace,
} from "@/hooks/useCourseWorkspace";
import type { CourseMilestone } from "@/types/learning";
import {
  formatDuration,
  formatRemainingTime,
  getProgressPercentage,
} from "@/utils/time";

function parseTimeUnit(value: string, max: number): number {
  const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(max, Math.max(0, parsed));
}

function splitSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return {
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
    seconds: safeSeconds % 60,
  };
}

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
  const [isTimeEditorOpen, setIsTimeEditorOpen] = useState(false);
  const [manualHours, setManualHours] = useState("0");
  const [manualMinutes, setManualMinutes] = useState("0");
  const [manualSeconds, setManualSeconds] = useState("0");

  useEffect(() => setProgress(persistedProgress), [persistedProgress]);

  const displayedProgressSeconds = Math.round(
    (progress / 100) * course.total_duration_sec,
  );
  const remaining = Math.max(
    0,
    course.total_duration_sec - displayedProgressSeconds,
  );
  const liveMilestones = buildCourseProgressMilestones(
    displayedProgressSeconds,
    course.total_duration_sec,
  );

  function openTimeEditor() {
    const units = splitSeconds(displayedProgressSeconds);
    setManualHours(units.hours.toString());
    setManualMinutes(units.minutes.toString());
    setManualSeconds(units.seconds.toString());
    setFeedback(null);
    setIsTimeEditorOpen(true);
  }

  function getManualProgressSeconds() {
    return Math.min(
      course.total_duration_sec,
      parseTimeUnit(manualHours, 9999) * 3600 +
        parseTimeUnit(manualMinutes, 59) * 60 +
        parseTimeUnit(manualSeconds, 59),
    );
  }

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

  async function saveProgress(nextProgressSeconds = displayedProgressSeconds) {
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateProgress(course.id, nextProgressSeconds);
      if (course.status === "backlog" && nextProgressSeconds > 0) {
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

  async function saveManualTime() {
    const nextProgressSeconds = getManualProgressSeconds();
    const nextProgress = getProgressPercentage(
      nextProgressSeconds,
      course.total_duration_sec,
    );
    setProgress(nextProgress);
    const saved = await saveProgress(nextProgressSeconds);
    if (saved) setIsTimeEditorOpen(false);
  }

  async function completeCourse() {
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateProgress(course.id, course.total_duration_sec);
      await updateStatus(course.id, "completed");
      router.back();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not complete this course.",
      );
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
            <Pressable
              accessibilityHint="Opens a precise time editor"
              accessibilityLabel="Edit learning time"
              accessibilityRole="button"
              onPress={openTimeEditor}
            >
              <Text className="text-4xl font-extrabold tracking-tight text-accent">
                {formatDuration(displayedProgressSeconds)}
              </Text>
            </Pressable>
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
              Drag the bar or tap the orange time to update precisely.
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
          {liveMilestones.map((milestone, index) => (
            <View className="min-h-28 flex-row" key={milestone.id}>
              <TimelineMarker
                isLast={index === liveMilestones.length - 1}
                milestone={milestone}
              />
              <View
                className={`min-w-0 flex-1 pb-8 pl-4 pt-1 ${
                  milestone.state === "upcoming" ? "opacity-40" : ""
                }`}
              >
                <View className="flex-row items-center">
                  {milestone.targetPercentage !== undefined ? (
                    <Text
                      className={`mr-3 text-sm font-extrabold ${
                        milestone.state === "upcoming"
                          ? "text-zinc-500"
                          : "text-accent"
                      }`}
                    >
                      {milestone.targetPercentage}%
                    </Text>
                  ) : null}
                  {milestone.state === "upcoming" ? (
                    <Text className="mr-3 text-base text-zinc-500">◌</Text>
                  ) : null}
                </View>
                <Text
                  className={`text-xl font-bold leading-7 ${
                    milestone.state === "upcoming"
                      ? "text-zinc-500"
                      : "text-cream"
                  }`}
                >
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
      <Modal
        animationType="fade"
        onRequestClose={() => setIsTimeEditorOpen(false)}
        statusBarTranslucent
        transparent
        visible={isTimeEditorOpen}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <Pressable
            accessibilityLabel="Close time editor"
            className="absolute inset-0 bg-black/80"
            onPress={() => setIsTimeEditorOpen(false)}
          />
          <View className="rounded-t-[34px] bg-surface px-6 pb-10 pt-4">
            <View className="mx-auto mb-7 h-1.5 w-16 rounded-full bg-zinc-500" />
            <Text className="text-3xl font-extrabold tracking-tight text-cream">
              Set learning time
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              Enter the exact amount you’ve completed. We’ll cap it at the
              course runtime.
            </Text>

            <View className="mt-7 flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-2 text-sm font-semibold text-muted">
                  Hours
                </Text>
                <TextInput
                  accessibilityLabel="Elapsed hours"
                  className="rounded-2xl bg-elevated px-4 py-4 text-2xl font-bold text-cream"
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={(value) =>
                    setManualHours(parseTimeUnit(value, 9999).toString())
                  }
                  placeholder="0"
                  placeholderTextColor="#737373"
                  selectionColor="#FF9D00"
                  value={manualHours === "0" ? "" : manualHours}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-semibold text-muted">
                  Minutes
                </Text>
                <TextInput
                  accessibilityLabel="Elapsed minutes"
                  className="rounded-2xl bg-elevated px-4 py-4 text-2xl font-bold text-cream"
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={(value) =>
                    setManualMinutes(parseTimeUnit(value, 59).toString())
                  }
                  placeholder="0"
                  placeholderTextColor="#737373"
                  selectionColor="#FF9D00"
                  value={manualMinutes === "0" ? "" : manualMinutes}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-semibold text-muted">
                  Seconds
                </Text>
                <TextInput
                  accessibilityLabel="Elapsed seconds"
                  className="rounded-2xl bg-elevated px-4 py-4 text-2xl font-bold text-cream"
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={(value) =>
                    setManualSeconds(parseTimeUnit(value, 59).toString())
                  }
                  placeholder="0"
                  placeholderTextColor="#737373"
                  selectionColor="#FF9D00"
                  value={manualSeconds === "0" ? "" : manualSeconds}
                />
              </View>
            </View>

            <View className="mt-5 rounded-3xl bg-elevated p-5">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-muted">
                Preview
              </Text>
              <Text className="mt-2 text-3xl font-extrabold text-accent">
                {formatDuration(getManualProgressSeconds())}
              </Text>
              <Text className="mt-1 text-sm text-muted">
                {formatRemainingTime(
                  Math.max(
                    0,
                    course.total_duration_sec - getManualProgressSeconds(),
                  ),
                )}{" "}
                remaining
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className={`mt-7 items-center rounded-2xl bg-accent px-6 py-5 ${
                isSaving ? "opacity-50" : "active:bg-orange-400"
              }`}
              disabled={isSaving}
              onPress={() => void saveManualTime()}
            >
              <Text className="text-lg font-bold text-black">
                {isSaving ? "Saving…" : "Save learning time"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
