import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useProductivity } from '@/contexts/ProductivityContext';

export default function ProfileScreen() {
  const { profile, email, isDemo, signOut, updateProfile } = useAuth();
  const { courses, todos } = useProductivity();
  const completedCourses = courses.filter((course) => course.status === 'completed').length;
  const completedTasks = todos.filter((todo) => todo.is_completed).length;

  function confirmSignOut() {
    Alert.alert(isDemo ? 'Leave demo?' : 'Sign out?', isDemo ? 'Your demo changes will reset.' : 'Your synced progress will be here when you return.', [
      { text: 'Cancel', style: 'cancel' },
      { text: isDemo ? 'Leave demo' : 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  async function togglePortfolio(value: boolean) {
    if (!profile) return;
    await updateProfile({
      fullName: profile.full_name ?? '',
      username: profile.username ?? '',
      bio: profile.bio ?? '',
      portfolioPublic: value,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['top']}>
      <ScrollView contentContainerClassName="px-6 pb-32 pt-8" showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-bold tracking-[3px] text-accent">YOUR IDENTITY</Text>
        <View className="mt-6 flex-row items-center">
          <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-accent">
            <Text className="text-3xl font-black text-black">{profile?.full_name?.slice(0, 1).toUpperCase() ?? 'A'}</Text>
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-2xl font-extrabold text-cream">{profile?.full_name ?? 'Independent learner'}</Text>
            <Text className="mt-1 text-sm text-muted">@{profile?.username ?? 'building'} · {email}</Text>
          </View>
        </View>

        {isDemo ? (
          <View className="mt-7 rounded-2xl bg-[#2C210D] p-4">
            <Text className="font-bold text-accent">You’re exploring demo mode.</Text>
            <Text className="mt-1 text-sm leading-5 text-zinc-300">Everything is interactive, but changes stay on this device session.</Text>
          </View>
        ) : null}

        <Text className="mt-8 text-base leading-6 text-zinc-300">{profile?.bio || 'Add a short statement about what you are becoming.'}</Text>

        <View className="mt-8 flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-surface p-5">
            <Text className="text-3xl font-extrabold text-accent">{completedCourses}</Text>
            <Text className="mt-2 text-sm text-muted">Courses completed</Text>
          </View>
          <View className="flex-1 rounded-3xl bg-surface p-5">
            <Text className="text-3xl font-extrabold text-accent">{completedTasks}</Text>
            <Text className="mt-2 text-sm text-muted">Actions shipped</Text>
          </View>
        </View>

        <View className="mt-8 gap-3">
          <Pressable className="flex-row items-center justify-between rounded-2xl bg-surface p-5" onPress={() => router.push('/edit-profile')}>
            <View><Text className="font-bold text-cream">Edit identity</Text><Text className="mt-1 text-sm text-muted">Name, username, and direction</Text></View>
            <Text className="text-2xl text-accent">›</Text>
          </Pressable>
          <Pressable className="flex-row items-center justify-between rounded-2xl bg-surface p-5" onPress={() => router.push('/portfolio')}>
            <View><Text className="font-bold text-cream">View learning portfolio</Text><Text className="mt-1 text-sm text-muted">See the public-facing story</Text></View>
            <Text className="text-2xl text-accent">›</Text>
          </Pressable>
          <View className="flex-row items-center justify-between rounded-2xl bg-surface p-5">
            <View className="mr-4 flex-1"><Text className="font-bold text-cream">Public portfolio</Text><Text className="mt-1 text-sm text-muted">Share completed learning paths</Text></View>
            <Switch onValueChange={(value) => void togglePortfolio(value)} thumbColor={profile?.portfolio_public ? '#0A0A0A' : '#D4D4D8'} trackColor={{ false: '#303033', true: '#FF9D00' }} value={profile?.portfolio_public ?? false} />
          </View>
          <Pressable className="items-center rounded-2xl bg-red-500/10 p-5" onPress={confirmSignOut}>
            <Text className="font-bold text-red-400">{isDemo ? 'Leave demo' : 'Sign out'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
