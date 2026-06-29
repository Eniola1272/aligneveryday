import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Course } from '@/types/database';
import type { DashboardTodo, TodoDraft } from '@/types/learning';

interface AddTodoModalProps {
  visible: boolean;
  courses: Course[];
  todo?: DashboardTodo | null;
  onClose: () => void;
  onAdd?: (input: TodoDraft) => Promise<unknown>;
  onUpdate?: (todoId: string, input: TodoDraft) => Promise<unknown>;
}

type DueChoice = 'today' | 'tomorrow' | 'none' | 'keep';

function getDueDate(choice: DueChoice, existingDueDate: string | null): string | null {
  if (choice === 'keep') return existingDueDate;
  if (choice === 'none') return null;
  const date = new Date();
  if (choice === 'tomorrow') date.setDate(date.getDate() + 1);
  date.setHours(18, 0, 0, 0);
  return date.toISOString();
}

function getDueChoice(value: string | null): DueChoice {
  if (!value) return 'none';
  const dueDate = new Date(value);
  if (dueDate.toDateString() === new Date().toDateString()) return 'today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dueDate.toDateString() === tomorrow.toDateString() ? 'tomorrow' : 'keep';
}

export function AddTodoModal({
  visible,
  courses,
  todo,
  onClose,
  onAdd,
  onUpdate,
}: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [dueChoice, setDueChoice] = useState<DueChoice>('today');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(todo?.task_title ?? '');
    setCourseId(todo?.course_id ?? null);
    setDueChoice(getDueChoice(todo?.due_date ?? null));
    setError(null);
  }, [todo, visible]);

  async function submit() {
    if (title.trim().length < 3) return setError('Make the action a little more specific.');
    setError(null);
    setIsSubmitting(true);
    try {
      const draft = { title, courseId, dueDate: getDueDate(dueChoice, todo?.due_date ?? null) };
      if (todo) await onUpdate?.(todo.id, draft);
      else await onAdd?.(draft);
      setTitle('');
      setCourseId(null);
      setDueChoice('today');
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save alignment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/80" onPress={onClose} />
        <View className="max-h-[85%] rounded-t-[34px] bg-surface px-6 pb-10 pt-4">
          <View className="mx-auto mb-7 h-1.5 w-16 rounded-full bg-zinc-500" />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text className="text-3xl font-extrabold tracking-tight text-cream">
              {todo ? 'Edit alignment' : 'Create an alignment'}
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              {todo ? 'Keep the action specific, relevant, and scheduled honestly.' : 'One concrete action you can finish—not a vague intention.'}
            </Text>

            {error ? <Text className="mt-5 text-sm text-red-400">{error}</Text> : null}

            <Text className="mb-2 mt-7 text-sm font-semibold text-zinc-300">What will you do?</Text>
            <TextInput
              autoFocus
              className="rounded-2xl bg-elevated px-5 py-4 text-base text-cream"
              onChangeText={setTitle}
              placeholder="e.g. Build the dashboard empty state"
              placeholderTextColor="#737373"
              selectionColor="#FF9D00"
              value={title}
            />

            <Text className="mb-3 mt-7 text-sm font-semibold text-zinc-300">Connect to a course</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                className={`mr-3 rounded-full px-4 py-3 ${courseId === null ? 'bg-accent' : 'bg-elevated'}`}
                onPress={() => setCourseId(null)}
              >
                <Text className={`font-semibold ${courseId === null ? 'text-black' : 'text-cream'}`}>Independent</Text>
              </Pressable>
              {courses.map((course) => (
                <Pressable
                  className={`mr-3 rounded-full px-4 py-3 ${courseId === course.id ? 'bg-accent' : 'bg-elevated'}`}
                  key={course.id}
                  onPress={() => setCourseId(course.id)}
                >
                  <Text className={`font-semibold ${courseId === course.id ? 'text-black' : 'text-cream'}`} numberOfLines={1}>
                    {course.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text className="mb-3 mt-7 text-sm font-semibold text-zinc-300">When?</Text>
            <View className="flex-row gap-3">
              {([
                'today',
                'tomorrow',
                ...(dueChoice === 'keep' ? (['keep'] as const) : []),
                'none',
              ] as const).map((choice) => (
                <Pressable
                  className={`flex-1 items-center rounded-2xl px-2 py-3 ${dueChoice === choice ? 'bg-accent' : 'bg-elevated'}`}
                  key={choice}
                  onPress={() => setDueChoice(choice)}
                >
                  <Text className={`text-sm font-semibold capitalize ${dueChoice === choice ? 'text-black' : 'text-cream'}`}>
                    {choice === 'none'
                      ? 'Someday'
                      : choice === 'keep'
                        ? new Date(todo?.due_date ?? '').toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : choice}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              className={`mt-8 items-center rounded-2xl bg-accent px-6 py-5 ${isSubmitting ? 'opacity-50' : 'active:opacity-75'}`}
              disabled={isSubmitting}
              onPress={submit}
            >
              <Text className="text-lg font-bold text-black">
                {isSubmitting ? 'Saving…' : todo ? 'Save changes' : 'Add alignment'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
