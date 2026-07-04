import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useProductivity } from "@/contexts/ProductivityContext";
import { formatDuration } from "@/utils/time";

export default function PortfolioScreen() {
  const { profile } = useAuth();
  const { courses, todos } = useProductivity();
  const completed = courses.filter((course) => course.status === "completed");
  const shipped = todos.filter((todo) => todo.is_completed).length;
  const learningSeconds = courses.reduce(
    (total, course) => total + course.current_progress_sec,
    0,
  );

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-20 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-3xl leading-8 text-cream">‹</Text>
          </Pressable>
          <View
            className={`rounded-full px-4 py-2 ${profile?.portfolio_public ? "bg-[#2C210D]" : "bg-surface"}`}
          >
            <Text
              className={`text-xs font-bold ${profile?.portfolio_public ? "text-accent" : "text-muted"}`}
            >
              {profile?.portfolio_public ? "PUBLIC" : "PRIVATE PREVIEW"}
            </Text>
          </View>
        </View>

        <Text className="mt-10 text-sm font-semibold uppercase tracking-[3px] text-accent">
          @{profile?.username ?? "portfolio"}
        </Text>
        <Text className="mt-4 text-5xl font-extrabold leading-[54px] tracking-tight text-cream">
          Learning,{`\n`}made visible.
        </Text>
        <Text className="mt-5 max-w-md text-lg leading-7 text-muted">
          {profile?.bio ||
            "A living record of self-directed education and the work it produced."}
        </Text>

        <View className="mt-10 flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-surface p-5">
            <Text className="text-3xl font-extrabold text-accent">
              {completed.length}
            </Text>
            <Text className="mt-2 text-xs leading-4 text-muted">
              Paths completed
            </Text>
          </View>
          <View className="flex-1 rounded-3xl bg-surface p-5">
            <Text className="text-3xl font-extrabold text-accent">
              {shipped}
            </Text>
            <Text className="mt-2 text-xs leading-4 text-muted">
              Actions shipped
            </Text>
          </View>
          <View className="flex-1 rounded-3xl bg-surface p-5">
            <Text className="text-xl font-extrabold text-accent">
              {formatDuration(learningSeconds).slice(0, 5)}
            </Text>
            <Text className="mt-2 text-xs leading-4 text-muted">
              Learning time
            </Text>
          </View>
        </View>

        <Text className="mt-12 text-2xl font-bold text-cream">
          Selected learning paths
        </Text>
        <View className="mt-5 gap-4">
          {completed.map((course) => (
            <View className="rounded-[28px] bg-surface p-6" key={course.id}>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-[2px] text-accent">
                  {course.platform}
                </Text>
                <Text className="text-lg text-accent">✓</Text>
              </View>
              <Text className="mt-5 text-2xl font-bold leading-7 text-cream">
                {course.title}
              </Text>
              <Text className="mt-3 text-sm leading-5 text-muted">
                Completed as part of a consistent self-directed learning
                practice.
              </Text>
            </View>
          ))}
          {completed.length === 0 ? (
            <View className="rounded-[28px] bg-surface p-7">
              <Text className="text-xl font-bold text-cream">
                Your first case study starts now.
              </Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Complete a learning path and it will become the first chapter in
                this portfolio.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
