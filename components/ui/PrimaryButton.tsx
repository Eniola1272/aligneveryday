import { ActivityIndicator, Pressable, Text } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  tone?: "accent" | "neutral" | "danger";
}

export function PrimaryButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  tone = "accent",
}: PrimaryButtonProps) {
  const background =
    tone === "accent"
      ? "bg-accent"
      : tone === "danger"
        ? "bg-red-500/15"
        : "bg-elevated";
  const foreground =
    tone === "accent"
      ? "text-black"
      : tone === "danger"
        ? "text-red-400"
        : "text-cream";

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-14 items-center justify-center rounded-2xl px-6 ${background} ${
        disabled || isLoading ? "opacity-50" : "active:opacity-75"
      }`}
      disabled={disabled || isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color={tone === "accent" ? "#0A0A0A" : "#F7F4EF"} />
      ) : (
        <Text className={`text-base font-bold ${foreground}`}>{label}</Text>
      )}
    </Pressable>
  );
}
