import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { getErrorMessage, useAuth } from '@/contexts/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!email.includes('@') || !password) {
      setError('Enter a valid email and your password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      footer={
        <Pressable className="items-center py-3" onPress={() => router.replace('/sign-up')}>
          <Text className="text-sm text-muted">
            New here? <Text className="font-bold text-accent">Create an account</Text>
          </Text>
        </Pressable>
      }
      subtitle="Pick up exactly where you left off. Your shelf and alignments are waiting."
      title="Welcome back."
    >
      {error ? (
        <View className="mb-5 rounded-2xl bg-red-500/10 p-4">
          <Text className="text-sm leading-5 text-red-400">{error}</Text>
        </View>
      ) : null}
      <FormField
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="you@example.com"
        value={email}
      />
      <FormField
        autoComplete="current-password"
        label="Password"
        onChangeText={setPassword}
        onSubmitEditing={submit}
        placeholder="Your password"
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <Pressable className="mb-7 self-end py-1" onPress={() => router.push('/forgot-password')}>
        <Text className="text-sm font-semibold text-accent">Forgot password?</Text>
      </Pressable>
      <PrimaryButton isLoading={isSubmitting} label="Sign in" onPress={submit} />
    </AuthScaffold>
  );
}
