import { Pressable, Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-5 flex-row items-end justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-2xl font-bold tracking-tight text-cream">{title}</Text>
        <Text className="mt-1 text-base text-muted">{subtitle}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-2 py-2 active:opacity-60"
        onPress={onPress}
      >
        <Text className="text-base font-medium text-accent">{actionLabel}</Text>
        <Text className="text-2xl leading-6 text-accent">›</Text>
      </Pressable>
    </View>
  );
}
