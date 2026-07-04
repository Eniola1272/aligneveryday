import { useState } from "react";
import { Switch, Text, View } from "react-native";

import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getErrorMessage, useAuth } from "@/contexts/AuthContext";

export default function OnboardingScreen() {
  const { profile, session, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(
    profile?.full_name ?? session?.user.user_metadata.full_name ?? "",
  );
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [portfolioPublic, setPortfolioPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (fullName.trim().length < 2)
      return setError("Add your name to continue.");
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      return setError(
        "Username must be 3–24 letters, numbers, or underscores.",
      );
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProfile({ fullName, username, bio, portfolioPublic });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      eyebrow="ONE MINUTE SETUP"
      subtitle="This becomes the identity attached to your learning portfolio. You can change it later."
      title="Make the workspace yours."
    >
      {error ? (
        <Text className="mb-5 text-sm text-red-400">{error}</Text>
      ) : null}
      <FormField
        label="Your name"
        onChangeText={setFullName}
        placeholder="Alex Morgan"
        value={fullName}
      />
      <FormField
        autoCapitalize="none"
        label="Portfolio username"
        onChangeText={(value) => setUsername(value.replace(/\s/g, ""))}
        placeholder="alexbuilds"
        value={username}
      />
      <FormField
        label="What are you becoming?"
        multiline
        onChangeText={setBio}
        placeholder="A product engineer who can turn ideas into useful systems."
        value={bio}
      />
      <View className="mb-8 flex-row items-center justify-between rounded-3xl bg-surface p-5">
        <View className="mr-4 flex-1">
          <Text className="font-bold text-cream">
            Public learning portfolio
          </Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            Let others see completed work—not private tasks.
          </Text>
        </View>
        <Switch
          onValueChange={setPortfolioPublic}
          thumbColor={portfolioPublic ? "#0A0A0A" : "#D4D4D8"}
          trackColor={{ false: "#303033", true: "#FF9D00" }}
          value={portfolioPublic}
        />
      </View>
      <PrimaryButton
        isLoading={isSubmitting}
        label="Enter my workspace"
        onPress={submit}
      />
    </AuthScaffold>
  );
}
