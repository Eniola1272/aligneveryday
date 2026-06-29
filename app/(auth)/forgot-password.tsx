import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { getErrorMessage, useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!email.includes('@')) return setError('Enter the email linked to your account.');
    setError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      subtitle="We’ll send a secure recovery link. Your courses and progress stay exactly where they are."
      title={sent ? 'Recovery sent.' : 'Reset your password.'}
    >
      {sent ? (
        <View className="rounded-3xl bg-surface p-6">
          <Text className="text-base leading-6 text-cream">Check {email} for your reset link.</Text>
          <View className="mt-6">
            <PrimaryButton label="Back to sign in" onPress={() => router.replace('/sign-in')} />
          </View>
        </View>
      ) : (
        <>
          {error ? <Text className="mb-5 text-sm text-red-400">{error}</Text> : null}
          <FormField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <PrimaryButton isLoading={isSubmitting} label="Send recovery link" onPress={submit} />
          <Pressable className="mt-5 items-center py-3" onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-muted">Cancel</Text>
          </Pressable>
        </>
      )}
    </AuthScaffold>
  );
}
