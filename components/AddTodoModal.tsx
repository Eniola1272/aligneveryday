import { useState } from 'react';
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

interface AddTodoInput {
  title: string;
  courseId: string | null;
  dueDate: string | null;
}

interface AddTodoModalProps {
  visible: boolean;
  courses: Course[];
  onClose: () => void;
  onAdd: (input: AddTodoInput) => Promise<unknown>;
}

type DueChoice = 'today' | 'tomorrow' | 'none';

function getDueDate(choice: DueChoice): string | null {
  if (choice === 'none') return null;
  const date = new Date();
  if (choice === 'tomorrow') date.setDate(date.getDate() + 1);
  date.setHours(18, 0, 0, 0);
  return date.toISOString();
}

export function AddTodoModal({ visible, courses, onClose, onAdd }: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [dueChoice, setDueChoice] = useState<DueChoice>('today');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (title.trim().length < 3) return setError('Make the action a little more specific.');
    setError(null);
    setIsSubmitting(true);
    try {
      await onAdd({ title, courseId, dueDate: getDueDate(dueChoice) });
      setTitle('');
      setCourseId(null);
      setDueChoice('today');
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to add alignment.');
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
            <Text className="text-3xl font-extrabold tracking-tight text-cream">Create an alignment</Text>
            <Text className="mt-2 text-base leading-6 text-muted">One concrete action you can finish—not a vague intention.</Text>

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
              {(['today', 'tomorrow', 'none'] as const).map((choice) => (
                <Pressable
                  className={`flex-1 items-center rounded-2xl px-2 py-3 ${dueChoice === choice ? 'bg-accent' : 'bg-elevated'}`}
                  key={choice}
                  onPress={() => setDueChoice(choice)}
                >
                  <Text className={`text-sm font-semibold capitalize ${dueChoice === choice ? 'text-black' : 'text-cream'}`}>
                    {choice === 'none' ? 'Someday' : choice}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              className={`mt-8 items-center rounded-2xl bg-accent px-6 py-5 ${isSubmitting ? 'opacity-50' : 'active:opacity-75'}`}
              disabled={isSubmitting}
              onPress={submit}
            >
              <Text className="text-lg font-bold text-black">{isSubmitting ? 'Creating…' : 'Add alignment'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
