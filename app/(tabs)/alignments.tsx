import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTodoModal } from '@/components/AddTodoModal';
import { useProductivity } from '@/contexts/ProductivityContext';
import { useCurrentDay } from '@/hooks/useCurrentDay';
import type { DashboardTodo } from '@/types/learning';
import { formatTaskDate, isAfterToday, isSameLocalDay } from '@/utils/date';

type TaskFilter = 'today' | 'upcoming' | 'past';

function getCompletionDate(todo: DashboardTodo): string | null {
  return todo.completed_at ?? todo.due_date;
}

function taskBelongsIn(todo: DashboardTodo, filter: TaskFilter): boolean {
  const completionDate = getCompletionDate(todo);
  if (filter === 'past') return todo.is_completed && !isSameLocalDay(completionDate);
  if (filter === 'upcoming') return !todo.is_completed && isAfterToday(todo.due_date);
  if (todo.is_completed) return isSameLocalDay(completionDate);
  return !todo.due_date || !isAfterToday(todo.due_date);
}

function sortTasks(tasks: DashboardTodo[], filter: TaskFilter): DashboardTodo[] {
  return [...tasks].sort((first, second) => {
    if (filter === 'past') {
      return (
        new Date(getCompletionDate(second) ?? 0).getTime() -
        new Date(getCompletionDate(first) ?? 0).getTime()
      );
    }
    if (filter === 'upcoming') {
      return new Date(first.due_date ?? 0).getTime() - new Date(second.due_date ?? 0).getTime();
    }
    return first.sort_order - second.sort_order;
  });
}

function getTaskMeta(todo: DashboardTodo, filter: TaskFilter): string {
  if (todo.is_completed) {
    return filter === 'today'
      ? 'Completed today'
      : `Completed ${formatTaskDate(getCompletionDate(todo))}`;
  }
  if (todo.due_date && !isSameLocalDay(todo.due_date) && !isAfterToday(todo.due_date)) {
    return 'Rolled into today';
  }
  return formatTaskDate(todo.due_date);
}

export default function AlignmentsScreen() {
  const {
    courses,
    todos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    error,
    refresh,
  } = useProductivity();
  const [filter, setFilter] = useState<TaskFilter>('today');
  const currentDay = useCurrentDay();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<DashboardTodo | null>(null);

  const visibleTodos = useMemo(
    () => sortTasks(todos.filter((todo) => taskBelongsIn(todo, filter)), filter),
    [currentDay, filter, todos],
  );
  const completedTodayCount = todos.filter(
    (todo) => todo.is_completed && isSameLocalDay(getCompletionDate(todo)),
  ).length;

  function openCreateModal() {
    setEditingTodo(null);
    setIsModalOpen(true);
  }

  function openEditModal(todo: DashboardTodo) {
    setEditingTodo(todo);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTodo(null);
  }

  function confirmDelete(todoId: string) {
    Alert.alert('Delete alignment?', 'This removes the action from your learning record.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteTodo(todoId) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-6 pb-32 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <View className="min-w-0 flex-1 pr-4">
            <Text className="text-xs font-bold tracking-[3px] text-accent">PRODUCTIVITY</Text>
            <Text className="mt-3 text-4xl font-extrabold tracking-tight text-cream">
              Alignments.
            </Text>
            <Text className="mt-2 text-base text-muted">
              Small actions that move the identity forward.
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Add alignment"
            className="h-12 w-12 items-center justify-center rounded-2xl bg-accent active:opacity-70"
            onPress={openCreateModal}
          >
            <Text className="text-3xl font-light text-black">+</Text>
          </Pressable>
        </View>

        <View className="mt-8 flex-row rounded-2xl bg-surface p-1.5">
          {(['today', 'upcoming', 'past'] as const).map((item) => (
            <Pressable
              className={`flex-1 items-center rounded-xl py-3 ${
                filter === item ? 'bg-elevated' : ''
              }`}
              key={item}
              onPress={() => setFilter(item)}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  filter === item ? 'text-accent' : 'text-muted'
                }`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? (
          <Pressable
            className="mt-6 rounded-2xl bg-red-500/10 p-4"
            onPress={() => void refresh()}
          >
            <Text className="font-bold text-red-400">
              Alignments could not sync. Tap to retry.
            </Text>
          </Pressable>
        ) : null}

        <View className="mt-7 gap-3">
          {visibleTodos.map((todo) => (
            <Pressable
              accessibilityHint="Opens this alignment for editing"
              accessibilityRole="button"
              className={`flex-row items-center rounded-[28px] p-5 active:bg-elevated ${
                todo.is_completed ? 'bg-[#141414]' : 'bg-surface'
              }`}
              key={todo.id}
              onPress={() => openEditModal(todo)}
            >
              <Pressable
                accessibilityLabel={todo.is_completed ? 'Mark incomplete' : 'Mark complete'}
                className={`mr-4 h-11 w-11 items-center justify-center rounded-full ${
                  todo.is_completed ? 'bg-accent' : 'border-2 border-zinc-600'
                }`}
                onPress={(event) => {
                  event.stopPropagation();
                  void toggleTodo(todo.id);
                }}
              >
                {todo.is_completed ? (
                  <Text className="text-xl font-black text-black">✓</Text>
                ) : null}
              </Pressable>

              <View className="min-w-0 flex-1">
                <Text
                  className={`text-lg font-semibold leading-6 ${
                    todo.is_completed ? 'text-zinc-500 line-through' : 'text-cream'
                  }`}
                >
                  {todo.task_title}
                </Text>
                <View className="mt-2 flex-row flex-wrap items-center">
                  {todo.courseLabel ? (
                    <Text className="mr-3 text-xs font-semibold text-accent">
                      {todo.courseLabel}
                    </Text>
                  ) : null}
                  <Text className="text-sm text-muted">{getTaskMeta(todo, filter)}</Text>
                </View>
              </View>

              <Pressable
                accessibilityLabel="Edit alignment"
                className="ml-2 p-3"
                onPress={(event) => {
                  event.stopPropagation();
                  openEditModal(todo);
                }}
              >
                <Text className="rotate-[135deg] text-lg text-accent">✏</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Delete alignment"
                className="p-3"
                onPress={(event) => {
                  event.stopPropagation();
                  confirmDelete(todo.id);
                }}
              >
                <Text className="text-xl text-zinc-600">×</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>

        {filter === 'today' && completedTodayCount > 0 ? (
          <View className="mt-5 rounded-2xl bg-[#2C210D] px-5 py-4">
            <Text className="font-bold text-accent">
              {completedTodayCount} {completedTodayCount === 1 ? 'alignment' : 'alignments'} done
              today.
            </Text>
            <Text className="mt-1 text-sm text-zinc-300">That work counts. Let it feel good.</Text>
          </View>
        ) : null}

        {visibleTodos.length === 0 ? (
          <View className="mt-8 rounded-[28px] bg-surface p-7">
            <Text className="text-3xl text-accent">✓</Text>
            <Text className="mt-4 text-xl font-bold text-cream">
              {filter === 'past'
                ? 'No completed history yet.'
                : filter === 'upcoming'
                  ? 'Nothing waiting ahead.'
                  : 'Clear runway.'}
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              {filter === 'today'
                ? 'Add one useful action, or enjoy the space you created.'
                : filter === 'upcoming'
                  ? 'Future alignments will collect here when you schedule them.'
                  : 'Completed alignments move here the day after you finish them.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <AddTodoModal
        courses={courses}
        onAdd={addTodo}
        onClose={closeModal}
        onUpdate={updateTodo}
        todo={editingTodo}
        visible={isModalOpen}
      />
    </SafeAreaView>
  );
}
