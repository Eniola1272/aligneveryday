import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { getErrorMessage, useAuth } from '@/contexts/AuthContext';

interface GoogleAuthButtonProps {
  onError: (message: string) => void;
}

export function GoogleAuthButton({ onError }: GoogleAuthButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    onError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      onError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Pressable
      accessibilityLabel="Continue with Google"
      accessibilityRole="button"
      className="h-14 flex-row items-center justify-center rounded-2xl bg-elevated px-5 active:opacity-80"
      disabled={isLoading}
      onPress={submit}
    >
      {isLoading ? (
        <ActivityIndicator color="#FF9800" />
      ) : (
        <>
          <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-cream">
            <Text className="text-base font-black text-[#4285F4]">G</Text>
          </View>
          <Text className="text-base font-bold text-cream">Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

export function AuthDivider() {
  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1 bg-white/10" />
      <Text className="px-4 text-xs font-semibold uppercase tracking-widest text-muted">or email</Text>
      <View className="h-px flex-1 bg-white/10" />
    </View>
  );
}
