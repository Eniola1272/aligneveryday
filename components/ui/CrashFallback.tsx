import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function CrashFallback({ resetError }: { resetError: () => void }) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-ink px-8">
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#2C210D]">
        <Text className="text-3xl text-accent">!</Text>
      </View>
      <Text className="mt-7 text-center text-3xl font-extrabold tracking-tight text-cream">
        Something slipped out of alignment.
      </Text>
      <Text className="mt-4 max-w-md text-center text-base leading-6 text-muted">
        Your saved learning data is safe. Try returning to the app; if the
        problem continues, we’ll have the technical details needed to
        investigate.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-8 min-h-14 w-full max-w-sm items-center justify-center rounded-2xl bg-accent px-6 active:opacity-75"
        onPress={resetError}
      >
        <Text className="text-base font-bold text-black">Try again</Text>
      </Pressable>
    </SafeAreaView>
  );
}
