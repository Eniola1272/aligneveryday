import { useEffect, useState } from "react";
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

import { DateRangeCalendar } from "@/components/DateRangeCalendar";
import type { Course } from "@/types/database";
import type { DashboardTodo, TodoDraft } from "@/types/learning";
import { endOfLocalDayIso, startOfLocalDayIso } from "@/utils/date";

interface AddTodoModalProps {
  visible: boolean;
  courses: Course[];
  todo?: DashboardTodo | null;
  onClose: () => void;
  onAdd?: (input: TodoDraft) => Promise<unknown>;
  onUpdate?: (todoId: string, input: TodoDraft) => Promise<unknown>;
}

export function AddTodoModal({
  visible,
  courses,
  todo,
  onClose,
  onAdd,
  onUpdate,
}: AddTodoModalProps) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(todo?.task_title ?? "");
    setCourseId(todo?.course_id ?? null);
    const defaultStart = startOfLocalDayIso(new Date());
    const defaultEnd = endOfLocalDayIso(new Date());
    setStartDate(todo ? (todo.start_date ?? todo.due_date) : defaultStart);
    setEndDate(todo ? todo.due_date : defaultEnd);
    setError(null);
  }, [todo, visible]);

  async function submit() {
    if (title.trim().length < 3)
      return setError("Make the action a little more specific.");
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return setError("Choose both a start and end date, or choose Someday.");
    }
    if (
      startDate &&
      endDate &&
      new Date(endDate).getTime() < new Date(startDate).getTime()
    ) {
      return setError("The end date cannot be before the start date.");
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const draft = { title, courseId, startDate, dueDate: endDate };
      if (todo) await onUpdate?.(todo.id, draft);
      else await onAdd?.(draft);
      setTitle("");
      setCourseId(null);
      setStartDate(null);
      setEndDate(null);
      onClose();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save alignment.",
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
        <Pressable className="absolute inset-0 bg-black/80" onPress={onClose} />
        <View className="max-h-[94%] rounded-t-[34px] bg-surface px-6 pb-10 pt-4">
          <View className="mx-auto mb-7 h-1.5 w-16 rounded-full bg-zinc-500" />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-3xl font-extrabold tracking-tight text-cream">
              {todo ? "Edit alignment" : "Create an alignment"}
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              {todo
                ? "Keep the action specific, relevant, and scheduled honestly."
                : "One concrete action you can finish—not a vague intention."}
            </Text>

            {error ? (
              <Text className="mt-5 text-sm text-red-400">{error}</Text>
            ) : null}

            <Text className="mb-2 mt-7 text-sm font-semibold text-zinc-300">
              What will you do?
            </Text>
            <TextInput
              accessibilityLabel="Alignment title"
              className="rounded-2xl bg-elevated px-5 py-4 text-base text-cream"
              onChangeText={setTitle}
              placeholder="e.g. Build the dashboard empty state"
              placeholderTextColor="#737373"
              selectionColor="#FF9D00"
              value={title}
            />

            <Text className="mb-3 mt-7 text-sm font-semibold text-zinc-300">
              Connect to a course
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                className={`mr-3 rounded-full px-4 py-3 ${courseId === null ? "bg-accent" : "bg-elevated"}`}
                onPress={() => setCourseId(null)}
              >
                <Text
                  className={`font-semibold ${courseId === null ? "text-black" : "text-cream"}`}
                >
                  Independent
                </Text>
              </Pressable>
              {courses.map((course) => (
                <Pressable
                  className={`mr-3 rounded-full px-4 py-3 ${courseId === course.id ? "bg-accent" : "bg-elevated"}`}
                  key={course.id}
                  onPress={() => setCourseId(course.id)}
                >
                  <Text
                    className={`font-semibold ${courseId === course.id ? "text-black" : "text-cream"}`}
                    numberOfLines={1}
                  >
                    {course.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text className="mb-3 mt-7 text-sm font-semibold text-zinc-300">
              When?
            </Text>
            <DateRangeCalendar
              endDate={endDate}
              onChange={(nextStart, nextEnd) => {
                setStartDate(nextStart);
                setEndDate(nextEnd);
                setError(null);
              }}
              startDate={startDate}
            />

            <Pressable
              accessibilityRole="button"
              className={`mt-8 items-center rounded-2xl bg-accent px-6 py-5 ${isSubmitting ? "opacity-50" : "active:opacity-75"}`}
              disabled={isSubmitting}
              onPress={submit}
            >
              <Text className="text-lg font-bold text-black">
                {isSubmitting
                  ? "Saving…"
                  : todo
                    ? "Save changes"
                    : "Add alignment"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
