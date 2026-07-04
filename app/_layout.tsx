import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProductivityProvider } from "@/contexts/ProductivityContext";

function AppNavigator() {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-accent">
          <Text className="text-3xl font-black text-black">A</Text>
        </View>
        <ActivityIndicator className="mt-7" color="#FF9D00" />
        <Text className="mt-4 text-sm text-muted">
          Preparing your workspace…
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        animation: "fade",
        contentStyle: { backgroundColor: "#0A0A0A" },
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && needsOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !needsOnboarding}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="edit-profile" />
      </Stack.Protected>

      <Stack.Screen name="update-password" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProductivityProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ProductivityProvider>
    </AuthProvider>
  );
}
