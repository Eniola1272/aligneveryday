import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTodoModal } from '@/components/AddTodoModal';
import { useProductivity } from '@/contexts/ProductivityContext';
import type { DashboardTodo } from '@/types/learning';

type TaskFilter = 'today' | 'upcoming' | 'completed';

function isToday(value: string | null) {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
}

export default function AlignmentsScreen() {
  const { courses, todos, addTodo, updateTodo, toggleTodo, deleteTodo, error, refresh } = useProductivity();
  const [filter, setFilter] = useState<TaskFilter>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<DashboardTodo | null>(null);

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
  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === 'completed') return todo.is_completed;
        if (todo.is_completed) return false;
        return filter === 'today' ? isToday(todo.due_date) || !todo.due_date : !isToday(todo.due_date);
      }),
    [filter, todos],
  );

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['top']}>
      <ScrollView contentContainerClassName="px-6 pb-32 pt-8" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-xs font-bold tracking-[3px] text-accent">PRODUCTIVITY</Text>
            <Text className="mt-3 text-4xl font-extrabold tracking-tight text-cream">Alignments.</Text>
            <Text className="mt-2 text-base text-muted">Small actions that move the identity forward.</Text>
          </View>
          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-accent" onPress={openCreateModal}>
            <Text className="text-3xl font-light text-black">+</Text>
          </Pressable>
        </View>

        <View className="mt-8 flex-row rounded-2xl bg-surface p-1.5">
          {(['today', 'upcoming', 'completed'] as const).map((item) => (
            <Pressable className={`flex-1 items-center rounded-xl py-3 ${filter === item ? 'bg-elevated' : ''}`} key={item} onPress={() => setFilter(item)}>
              <Text className={`text-xs font-semibold capitalize ${filter === item ? 'text-accent' : 'text-muted'}`}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {error ? (
          <Pressable className="mt-6 rounded-2xl bg-red-500/10 p-4" onPress={() => void refresh()}>
            <Text className="font-bold text-red-400">Alignments could not sync. Tap to retry.</Text>
          </Pressable>
        ) : null}

        <View className="mt-7 gap-3">
          {visibleTodos.map((todo) => (
            <View className="flex-row items-center rounded-2xl bg-surface p-4" key={todo.id}>
              <Pressable
                accessibilityLabel={todo.is_completed ? 'Mark incomplete' : 'Mark complete'}
                className={`mr-4 h-8 w-8 items-center justify-center rounded-full ${todo.is_completed ? 'bg-accent' : 'border-2 border-zinc-600'}`}
                onPress={() => void toggleTodo(todo.id)}
              >
                {todo.is_completed ? <Text className="font-black text-black">✓</Text> : null}
              </Pressable>
              <View className="min-w-0 flex-1">
                <Text className={`text-base font-semibold leading-6 ${todo.is_completed ? 'text-zinc-500 line-through' : 'text-cream'}`}>{todo.task_title}</Text>
                <View className="mt-2 flex-row items-center">
                  {todo.courseLabel ? <Text className="mr-3 text-xs font-semibold text-accent">{todo.courseLabel}</Text> : null}
                  <Text className="text-xs text-muted">{todo.due_date ? (isToday(todo.due_date) ? 'Today' : new Date(todo.due_date).toLocaleDateString()) : 'No deadline'}</Text>
                </View>
              </View>
              <Pressable accessibilityLabel="Edit alignment" className="ml-2 p-2" onPress={() => openEditModal(todo)}>
                <Text className="text-base text-accent">✎</Text>
              </Pressable>
              <Pressable accessibilityLabel="Delete alignment" className="ml-3 p-2" onPress={() => confirmDelete(todo.id)}>
                <Text className="text-lg text-zinc-600">×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {visibleTodos.length === 0 ? (
          <View className="mt-8 rounded-[28px] bg-surface p-7">
            <Text className="text-3xl text-accent">✓</Text>
            <Text className="mt-4 text-xl font-bold text-cream">{filter === 'completed' ? 'No completed work yet.' : 'Clear runway.'}</Text>
            <Text className="mt-2 text-base leading-6 text-muted">{filter === 'today' ? 'Add one useful action, or enjoy the space you created.' : 'Your alignments will appear here when they match this view.'}</Text>
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
