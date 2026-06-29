import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';

const promises = [
  ['01', 'Collect', 'Bring courses and self-directed learning into one focused shelf.'],
  ['02', 'Align', 'Turn what you are learning into small, finishable actions.'],
  ['03', 'Prove', 'Shape completed work into a portfolio that shows how you think.'],
] as const;

export default function WelcomeScreen() {
  const { enterDemo } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-1 px-6 pb-8 pt-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold tracking-[3px] text-accent">ALIGN EVERYDAY</Text>
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent">
            <Text className="text-lg font-black text-black">A</Text>
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[46px] font-extrabold leading-[50px] tracking-tight text-cream">
            Learning is only{`\n`}valuable when it{`\n`}
            <Text className="text-accent">changes your work.</Text>
          </Text>
          <Text className="mt-5 max-w-md text-lg leading-7 text-muted">
            A calm operating system for learning, doing, and making your progress visible.
          </Text>
        </View>

        <View className="mt-10 flex-1 justify-center gap-4">
          {promises.map(([number, title, copy]) => (
            <View className="flex-row rounded-3xl bg-surface p-5" key={number}>
              <Text className="mr-4 text-sm font-bold text-accent">{number}</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-cream">{title}</Text>
                <Text className="mt-1 text-sm leading-5 text-muted">{copy}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-8 gap-3">
          <PrimaryButton label="Create your workspace" onPress={() => router.push('/sign-up')} />
          <Pressable
            className="min-h-14 items-center justify-center rounded-2xl bg-surface active:opacity-70"
            onPress={() => router.push('/sign-in')}
          >
            <Text className="font-bold text-cream">I already have an account</Text>
          </Pressable>
          <Pressable className="items-center py-2" onPress={enterDemo}>
            <Text className="text-sm font-semibold text-accent">Explore with demo data →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
