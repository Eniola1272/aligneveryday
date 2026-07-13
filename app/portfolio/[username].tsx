import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import type { Course, Profile } from "@/types/database";
import { formatDuration } from "@/utils/time";

export default function PublicPortfolioScreen() {
  const params = useLocalSearchParams<{ username?: string | string[] }>();
  const username = Array.isArray(params.username)
    ? params.username[0]
    : params.username;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function hydratePublicPortfolio() {
      if (!username) return;
      if (!supabase) {
        setError("Public portfolios need Supabase to be configured.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const profileResult = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (profileResult.error || !profileResult.data) {
        setProfile(null);
        setCourses([]);
        setError("This portfolio is private or does not exist.");
        setIsLoading(false);
        return;
      }

      const coursesResult = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", profileResult.data.id)
        .eq("status", "completed");

      if (coursesResult.error) {
        setError("We couldn’t load this trophy room.");
        setIsLoading(false);
        return;
      }

      setProfile(profileResult.data);
      setCourses(coursesResult.data ?? []);
      setIsLoading(false);
    }

    void hydratePublicPortfolio();
  }, [username]);

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
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          onPress={() => router.back()}
        >
          <Text className="text-3xl leading-8 text-cream">‹</Text>
        </Pressable>

        {isLoading ? (
          <View className="mt-24 items-center">
            <ActivityIndicator color="#FF9D00" />
            <Text className="mt-4 text-sm text-muted">
              Opening trophy room…
            </Text>
          </View>
        ) : error ? (
          <View className="mt-16 rounded-[30px] bg-surface p-7">
            <Text className="text-2xl font-extrabold text-cream">
              Trophy room unavailable
            </Text>
            <Text className="mt-3 text-base leading-6 text-muted">{error}</Text>
          </View>
        ) : profile ? (
          <>
            <View className="mt-10 flex-row items-center">
              <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-accent">
                <Text className="text-2xl font-black text-black">
                  {profile.full_name?.slice(0, 1).toUpperCase() ?? "A"}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-sm font-semibold uppercase tracking-[3px] text-accent">
                  @{profile.username}
                </Text>
                <Text className="mt-1 text-2xl font-extrabold text-cream">
                  {profile.full_name ?? "Independent learner"}
                </Text>
              </View>
            </View>

            <Text className="mt-8 text-5xl font-extrabold leading-[54px] tracking-tight text-cream">
              Trophy room.
            </Text>
            <Text className="mt-5 max-w-md text-lg leading-7 text-muted">
              {profile.bio ||
                "A public record of completed learning paths and self-directed growth."}
            </Text>

            <View className="mt-10 flex-row gap-3">
              <View className="flex-1 rounded-3xl bg-surface p-5">
                <Text className="text-3xl font-extrabold text-accent">
                  {courses.length}
                </Text>
                <Text className="mt-2 text-xs leading-4 text-muted">
                  Trophies earned
                </Text>
              </View>
              <View className="flex-1 rounded-3xl bg-surface p-5">
                <Text className="text-xl font-extrabold text-accent">
                  {formatDuration(learningSeconds).slice(0, 5)}
                </Text>
                <Text className="mt-2 text-xs leading-4 text-muted">
                  Time invested
                </Text>
              </View>
            </View>

            <View className="mt-10 gap-4">
              {courses.map((course) => (
                <View className="rounded-[28px] bg-surface p-6" key={course.id}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold uppercase tracking-[2px] text-accent">
                      {course.platform}
                    </Text>
                    <Text className="text-lg text-accent">🏆</Text>
                  </View>
                  <Text className="mt-5 text-2xl font-bold leading-7 text-cream">
                    {course.title}
                  </Text>
                  <Text className="mt-3 text-sm leading-5 text-muted">
                    Completed and added to this public learning record.
                  </Text>
                </View>
              ))}
              {courses.length === 0 ? (
                <View className="rounded-[28px] bg-surface p-7">
                  <Text className="text-xl font-bold text-cream">
                    No public trophies yet.
                  </Text>
                  <Text className="mt-2 text-base leading-6 text-muted">
                    Completed courses will appear here when this learner is
                    ready to show them.
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
