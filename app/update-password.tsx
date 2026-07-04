import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getErrorMessage, useAuth } from "@/contexts/AuthContext";

export default function UpdatePasswordScreen() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (password.length < 8) return setError("Use at least 8 characters.");
    setIsSubmitting(true);
    setError(null);
    try {
      await updatePassword(password);
      router.replace("/");
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      subtitle="Choose something memorable and unique to this account."
      title="New password."
    >
      {error ? (
        <Text className="mb-5 text-sm text-red-400">{error}</Text>
      ) : null}
      <FormField
        autoComplete="new-password"
        label="Password"
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
      />
      <PrimaryButton
        isLoading={isSubmitting}
        label="Update password"
        onPress={submit}
      />
    </AuthScaffold>
  );
}
