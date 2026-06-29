import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScaffoldProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export function AuthScaffold({
  eyebrow = 'ALIGN EVERYDAY',
  title,
  subtitle,
  children,
  footer,
}: AuthScaffoldProps) {
  return (
    <SafeAreaView className="flex-1 bg-ink">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-between px-6 pb-8 pt-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="text-xs font-bold tracking-[3px] text-accent">{eyebrow}</Text>
            <Text className="mt-5 text-4xl font-extrabold leading-[44px] tracking-tight text-cream">
              {title}
            </Text>
            <Text className="mt-4 max-w-md text-base leading-6 text-muted">{subtitle}</Text>
            <View className="mt-10">{children}</View>
          </View>
          {footer ? <View className="mt-10">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
