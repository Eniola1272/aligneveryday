import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
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

import type { LearningPlatform } from '@/types/database';
import type { AddShelfDraft } from '@/types/learning';

interface AddShelfModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd?: (draft: AddShelfDraft) => void;
}

interface PlatformOption {
  label: string;
  value: LearningPlatform;
  glyph: string;
}

const platformOptions: PlatformOption[] = [
  { label: 'YouTube', value: 'YouTube', glyph: '▶' },
  { label: 'Udemy', value: 'Udemy', glyph: 'U' },
  { label: 'Coursera', value: 'Coursera', glyph: 'C' },
  { label: 'Custom Manual Entry', value: 'Custom', glyph: '✎' },
];

const demoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function parseNumber(value: string, max: number): number {
  const nextValue = Number.parseInt(value.replace(/\D/g, ''), 10);
  if (Number.isNaN(nextValue)) return 0;
  return Math.min(max, Math.max(0, nextValue));
}

export default function AddShelfModal({
  visible,
  onClose,
  onAdd,
}: AddShelfModalProps) {
  const [sourceUrl, setSourceUrl] = useState(demoUrl);
  const [clipboardValue, setClipboardValue] = useState('https://youtube.com/...');
  const [platform, setPlatform] = useState<LearningPlatform>('YouTube');
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(45);

  useEffect(() => {
    if (!visible) return;

    async function readClipboard() {
      const value = await Clipboard.getStringAsync();
      if (/^https?:\/\//i.test(value)) setClipboardValue(value);
    }

    void readClipboard();
  }, [visible]);

  const truncatedClipboard = useMemo(() => {
    if (clipboardValue.length <= 32) return clipboardValue;
    return `${clipboardValue.slice(0, 29)}…`;
  }, [clipboardValue]);

  function submit() {
    onAdd?.({ sourceUrl, platform, hours, minutes });
    onClose();
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              Add to Learning Shelf
            </Text>

            <View className="flex-row items-center rounded-3xl bg-elevated px-5 py-4">
              <Text className="mr-4 text-2xl text-muted">↗</Text>
              <TextInput
                accessibilityLabel="Course link"
                autoCapitalize="none"
                autoCorrect={false}
                className="min-w-0 flex-1 text-base text-cream"
                onChangeText={setSourceUrl}
                placeholder="Paste a course or video link"
                placeholderTextColor="#737373"
                selectionColor="#FF9D00"
                value={sourceUrl}
              />
              {sourceUrl ? (
                <Pressable
                  accessibilityLabel="Clear link"
                  className="ml-3 h-7 w-7 items-center justify-center rounded-full bg-zinc-600 active:opacity-60"
                  onPress={() => setSourceUrl('')}
                >
                  <Text className="font-bold text-zinc-950">×</Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-3 flex-row items-center rounded-full bg-[#2C210D] px-5 py-3.5 active:opacity-70"
              onPress={() => setSourceUrl(clipboardValue)}
            >
              <Text className="mr-3 text-lg text-accent">▣</Text>
              <Text className="flex-1 text-sm font-medium text-accent" numberOfLines={1}>
                Paste from clipboard: {truncatedClipboard}
              </Text>
              <Text className="text-xl text-accent">›</Text>
            </Pressable>

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
                      selected ? 'bg-accent' : 'bg-elevated'
                    }`}
                    key={option.value}
                    onPress={() => setPlatform(option.value)}
                  >
                    <Text
                      className={`mr-2 text-base font-bold ${selected ? 'text-black' : 'text-cream'}`}
                    >
                      {option.glyph}
                    </Text>
                    <Text
                      className={`text-sm font-medium ${selected ? 'text-black' : 'text-cream'}`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="mt-8">
              <View className="flex-row items-baseline">
                <Text className="text-xl font-bold text-cream">Total Runtime</Text>
                <Text className="ml-2 text-base text-zinc-400">(optional)</Text>
              </View>
              <Text className="mt-1 text-sm text-muted">Helps estimate your learning time.</Text>

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
                    value={hours.toString().padStart(2, '0')}
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
                    value={minutes.toString().padStart(2, '0')}
                  />
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-8 items-center rounded-2xl bg-accent px-6 py-5 active:bg-orange-400"
              onPress={submit}
            >
              <Text className="text-lg font-bold text-black">Add to Shelf</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
