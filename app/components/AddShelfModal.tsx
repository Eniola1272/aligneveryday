import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Course, CourseStatus, LearningPlatform } from "@/types/database";
import type { AddShelfDraft } from "@/types/learning";

interface AddShelfModalProps {
  visible: boolean;
  course?: Course | null;
  onClose: () => void;
  onAdd?: (draft: AddShelfDraft) => void | Promise<void>;
  onUpdate?: (courseId: string, draft: AddShelfDraft) => void | Promise<void>;
}

interface PlatformOption {
  label: string;
  value: LearningPlatform;
  glyph: string;
}

const platformOptions: PlatformOption[] = [
  { label: "YouTube", value: "YouTube", glyph: "▶" },
  { label: "Udemy", value: "Udemy", glyph: "U" },
  { label: "Coursera", value: "Coursera", glyph: "C" },
  { label: "Custom Manual Entry", value: "Custom", glyph: "✎" },
];

function parseNumber(value: string, max: number): number {
  const nextValue = Number.parseInt(value.replace(/\D/g, ""), 10);
  if (Number.isNaN(nextValue)) return 0;
  return Math.min(max, Math.max(0, nextValue));
}

export default function AddShelfModal({
  visible,
  course,
  onClose,
  onAdd,
  onUpdate,
}: AddShelfModalProps) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [clipboardValue, setClipboardValue] = useState("");
  const [platform, setPlatform] = useState<LearningPlatform>("YouTube");
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(45);
  const [status, setStatus] = useState<CourseStatus>("in_progress");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (course) {
      setTitle(course.title);
      setSourceUrl(course.source_url ?? "");
      setPlatform(course.platform);
      setHours(Math.floor(course.total_duration_sec / 3600));
      setMinutes(Math.floor((course.total_duration_sec % 3600) / 60));
      setStatus(course.status);
      setError(null);
    }

    async function readClipboard() {
      try {
        const value = await Clipboard.getStringAsync();
        if (/^https?:\/\//i.test(value)) setClipboardValue(value);
      } catch {
        // Clipboard access can be unavailable until the user explicitly pastes.
      }
    }

    void readClipboard();
  }, [course, visible]);

  function updateSourceUrl(value: string) {
    setSourceUrl(value);
    const normalized = value.toLowerCase();
    if (normalized.includes("youtube.com") || normalized.includes("youtu.be"))
      setPlatform("YouTube");
    else if (normalized.includes("udemy.com")) setPlatform("Udemy");
    else if (normalized.includes("coursera.org")) setPlatform("Coursera");
  }

  const truncatedClipboard = useMemo(() => {
    if (clipboardValue.length <= 32) return clipboardValue;
    return `${clipboardValue.slice(0, 29)}…`;
  }, [clipboardValue]);

  async function submit() {
    if (!title.trim()) {
      setError("Give this learning path a clear title.");
      return;
    }
    if (sourceUrl.trim() && !/^https?:\/\//i.test(sourceUrl.trim())) {
      setError("Use a complete link beginning with http:// or https://.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const draft = { title, sourceUrl, platform, hours, minutes, status };
      if (course) await onUpdate?.(course.id, draft);
      else await onAdd?.(draft);
      setTitle("");
      setSourceUrl("");
      setStatus("in_progress");
      onClose();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to add this course.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable
          accessibilityLabel="Close add to shelf sheet"
          className="absolute inset-0 bg-black/80"
          onPress={onClose}
        />

        <View className="max-h-[88%] rounded-t-[34px] bg-surface px-6 pb-10 pt-4">
          <View className="mx-auto mb-7 h-1.5 w-16 rounded-full bg-zinc-500" />
          <ScrollView
            contentContainerClassName="pb-2"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="mb-6 text-3xl font-extrabold tracking-tight text-cream">
              {course ? "Edit Learning Path" : "Add to Learning Shelf"}
            </Text>

            {error ? (
              <View className="mb-4 rounded-2xl bg-red-500/10 p-4">
                <Text className="text-sm text-red-400">{error}</Text>
              </View>
            ) : null}

            <Text className="mb-2 text-sm font-semibold text-zinc-300">
              Course title
            </Text>
            <TextInput
              accessibilityLabel="Course title"
              className="mb-4 rounded-2xl bg-elevated px-5 py-4 text-base text-cream"
              onChangeText={setTitle}
              placeholder="e.g. Advanced React Patterns"
              placeholderTextColor="#737373"
              selectionColor="#FF9D00"
              value={title}
            />

            <View className="flex-row items-center rounded-3xl bg-elevated px-5 py-4">
              <Text className="mr-4 text-2xl text-muted">↗</Text>
              <TextInput
                accessibilityLabel="Course link"
                autoCapitalize="none"
                autoCorrect={false}
                className="min-w-0 flex-1 text-base text-cream"
                onChangeText={updateSourceUrl}
                placeholder="Paste a course or video link"
                placeholderTextColor="#737373"
                selectionColor="#FF9D00"
                value={sourceUrl}
              />
              {sourceUrl ? (
                <Pressable
                  accessibilityLabel="Clear link"
                  className="ml-3 h-7 w-7 items-center justify-center rounded-full bg-zinc-600 active:opacity-60"
                  onPress={() => setSourceUrl("")}
                >
                  <Text className="font-bold text-zinc-950">×</Text>
                </Pressable>
              ) : null}
            </View>

            {clipboardValue ? (
              <Pressable
                accessibilityRole="button"
                className="mt-3 flex-row items-center rounded-full bg-[#2C210D] px-5 py-3.5 active:opacity-70"
                onPress={() => updateSourceUrl(clipboardValue)}
              >
                <Text className="mr-3 text-lg text-accent">▣</Text>
                <Text
                  className="flex-1 text-sm font-medium text-accent"
                  numberOfLines={1}
                >
                  Paste from clipboard: {truncatedClipboard}
                </Text>
                <Text className="text-xl text-accent">›</Text>
              </Pressable>
            ) : null}

            <ScrollView
              className="-mx-6 mt-6"
              contentContainerClassName="gap-3 px-6"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {platformOptions.map((option) => {
                const selected = platform === option.value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    className={`flex-row items-center rounded-full px-5 py-3.5 active:opacity-70 ${
                      selected ? "bg-accent" : "bg-elevated"
                    }`}
                    key={option.value}
                    onPress={() => setPlatform(option.value)}
                  >
                    <Text
                      className={`mr-2 text-base font-bold ${selected ? "text-black" : "text-cream"}`}
                    >
                      {option.glyph}
                    </Text>
                    <Text
                      className={`text-sm font-medium ${selected ? "text-black" : "text-cream"}`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="mt-8">
              <View className="flex-row items-baseline">
                <Text className="text-xl font-bold text-cream">
                  Total Runtime
                </Text>
                <Text className="ml-2 text-base text-zinc-400">(optional)</Text>
              </View>
              <Text className="mt-1 text-sm text-muted">
                Helps estimate your learning time.
              </Text>

              <View className="mt-5 flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-2 text-sm text-muted">Hours</Text>
                  <TextInput
                    accessibilityLabel="Hours"
                    className="rounded-2xl bg-elevated px-5 py-4 text-2xl text-cream"
                    keyboardType="number-pad"
                    maxLength={2}
                    onChangeText={(value) => setHours(parseNumber(value, 99))}
                    selectionColor="#FF9D00"
                    value={hours.toString().padStart(2, "0")}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-sm text-muted">Minutes</Text>
                  <TextInput
                    accessibilityLabel="Minutes"
                    className="rounded-2xl bg-elevated px-5 py-4 text-2xl text-cream"
                    keyboardType="number-pad"
                    maxLength={2}
                    onChangeText={(value) => setMinutes(parseNumber(value, 59))}
                    selectionColor="#FF9D00"
                    value={minutes.toString().padStart(2, "0")}
                  />
                </View>
              </View>
            </View>

            <Text className="mb-3 mt-7 text-sm font-semibold text-zinc-300">
              Shelf position
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                className={`flex-1 rounded-2xl px-4 py-4 ${status === "in_progress" ? "bg-accent" : "bg-elevated"}`}
                onPress={() => setStatus("in_progress")}
              >
                <Text
                  className={`font-bold ${status === "in_progress" ? "text-black" : "text-cream"}`}
                >
                  Start now
                </Text>
                <Text
                  className={`mt-1 text-xs ${status === "in_progress" ? "text-black/70" : "text-muted"}`}
                >
                  Add to focus
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 rounded-2xl px-4 py-4 ${status === "backlog" ? "bg-accent" : "bg-elevated"}`}
                onPress={() => setStatus("backlog")}
              >
                <Text
                  className={`font-bold ${status === "backlog" ? "text-black" : "text-cream"}`}
                >
                  Save for later
                </Text>
                <Text
                  className={`mt-1 text-xs ${status === "backlog" ? "text-black/70" : "text-muted"}`}
                >
                  Keep in backlog
                </Text>
              </Pressable>
              {course ? (
                <Pressable
                  className={`flex-1 rounded-2xl px-4 py-4 ${status === "completed" ? "bg-accent" : "bg-elevated"}`}
                  onPress={() => setStatus("completed")}
                >
                  <Text
                    className={`font-bold ${status === "completed" ? "text-black" : "text-cream"}`}
                  >
                    Completed
                  </Text>
                  <Text
                    className={`mt-1 text-xs ${status === "completed" ? "text-black/70" : "text-muted"}`}
                  >
                    Publish proof
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              className={`mt-8 items-center rounded-2xl bg-accent px-6 py-5 ${
                isSubmitting ? "opacity-50" : "active:bg-orange-400"
              }`}
              disabled={isSubmitting}
              onPress={submit}
            >
              <Text className="text-lg font-bold text-black">
                {isSubmitting
                  ? "Saving…"
                  : course
                    ? "Save changes"
                    : "Add to Shelf"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
