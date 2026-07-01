import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { FormField } from '@/components/ui/FormField';
import { AuthDivider, GoogleAuthButton } from '@/components/ui/GoogleAuthButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { getErrorMessage, useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  async function submit() {
    if (fullName.trim().length < 2) return setError('Tell us what to call you.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError('A valid email address is required.');
    }
    if (password.length < 8) return setError('Use at least 8 characters for your password.');

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signUp({ fullName, email, password });
      if (result.needsEmailConfirmation) setConfirmationEmail(email);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <AuthScaffold
        subtitle={`We sent a confirmation link to ${confirmationEmail}. Open it, then return here to continue.`}
        title="Check your inbox."
      >
        <View className="rounded-3xl bg-surface p-6">
          <Text className="text-3xl text-accent">✦</Text>
          <Text className="mt-5 text-xl font-bold text-cream">Your workspace is almost ready.</Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            Confirm your address in the same device for the smoothest handoff.
          </Text>
        </View>
        <View className="mt-6">
          <PrimaryButton label="Return to sign in" onPress={() => router.replace('/sign-in')} />
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      footer={
        <Pressable className="items-center py-3" onPress={() => router.replace('/sign-in')}>
          <Text className="text-sm text-muted">
            Already aligned? <Text className="font-bold text-accent">Sign in</Text>
          </Text>
        </Pressable>
      }
      subtitle="Start with one course and one useful action. The system grows with you."
      title="Build a body of work."
    >
      {error ? (
        <View className="mb-5 rounded-2xl bg-red-500/10 p-4">
          <Text className="text-sm leading-5 text-red-400">{error}</Text>
        </View>
      ) : null}
      <GoogleAuthButton onError={(message) => setError(message || null)} />
      <AuthDivider />
      <FormField
        autoComplete="name"
        label="Full name"
        onChangeText={setFullName}
        placeholder="Alex Morgan"
        value={fullName}
      />
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
        autoComplete="new-password"
        label="Password"
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
      />
      <Text className="mb-7 -mt-2 text-xs leading-5 text-muted">
        By continuing, you agree to use Align Everyday as a tool for your own learning records.
      </Text>
      <PrimaryButton isLoading={isSubmitting} label="Create workspace" onPress={submit} />
    </AuthScaffold>
  );
}
