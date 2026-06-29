import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { getErrorMessage, useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [portfolioPublic, setPortfolioPublic] = useState(profile?.portfolio_public ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (fullName.trim().length < 2) return setError('Add your name.');
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) return setError('Use 3–24 letters, numbers, or underscores.');
    setError(null);
    setIsSubmitting(true);
    try {
      await updateProfile({ fullName, username, bio, portfolioPublic });
      router.back();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScaffold eyebrow="PROFILE" subtitle="Keep this honest, specific, and close to the work you want to be known for." title="Edit your identity.">
      {error ? <Text className="mb-5 text-sm text-red-400">{error}</Text> : null}
      <FormField label="Full name" onChangeText={setFullName} value={fullName} />
      <FormField autoCapitalize="none" label="Username" onChangeText={(value) => setUsername(value.replace(/\s/g, ''))} value={username} />
      <FormField label="What are you becoming?" multiline onChangeText={setBio} value={bio} />
      <View className="mb-8 flex-row items-center justify-between rounded-2xl bg-surface p-5">
        <Text className="font-bold text-cream">Public portfolio</Text>
        <Switch onValueChange={setPortfolioPublic} thumbColor={portfolioPublic ? '#0A0A0A' : '#D4D4D8'} trackColor={{ false: '#303033', true: '#FF9D00' }} value={portfolioPublic} />
      </View>
      <PrimaryButton isLoading={isSubmitting} label="Save changes" onPress={submit} />
      <View className="mt-3"><PrimaryButton label="Cancel" onPress={() => router.back()} tone="neutral" /></View>
    </AuthScaffold>
  );
}
