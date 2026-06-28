import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PortfolioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-32 pt-10">
        <Text className="text-sm font-semibold uppercase tracking-[3px] text-accent">
          Public proof of work
        </Text>
        <Text className="mt-4 text-5xl font-extrabold leading-[54px] tracking-tight text-cream">
          Your learning,{`\n`}made visible.
        </Text>
        <Text className="mt-5 max-w-sm text-lg leading-7 text-muted">
          Completed courses and case studies will collect here as a living record of your
          self-directed education.
        </Text>

        <View className="mt-12 rounded-[28px] bg-surface p-7">
          <Text className="text-4xl font-bold text-accent">03</Text>
          <Text className="mt-2 text-xl font-semibold text-cream">Active learning paths</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Finish your first path to publish a portfolio milestone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
