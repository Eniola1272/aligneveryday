import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage, useAuth } from "@/contexts/AuthContext";
import { usePortfolioNetwork } from "@/contexts/PortfolioNetworkContext";
import { useProductivity } from "@/contexts/ProductivityContext";
import type { Course, Profile } from "@/types/database";
import { formatDuration } from "@/utils/time";

type TrophyTab = "mine" | "friends";

function TrophyCard({ course }: { course: Course }) {
  return (
    <View className="rounded-[28px] bg-surface p-6">
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
        Completed as part of a consistent self-directed learning practice.
      </Text>
    </View>
  );
}

function ProfileBadge({ profile }: { profile: Profile }) {
  return (
    <View className="flex-row items-center">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-accent">
        <Text className="text-xl font-black text-black">
          {profile.full_name?.slice(0, 1).toUpperCase() ?? "A"}
        </Text>
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <Text className="font-bold text-cream" numberOfLines={1}>
          {profile.full_name ?? "Independent learner"}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">
          @{profile.username ?? "portfolio"}
        </Text>
      </View>
    </View>
  );
}

export default function PortfolioScreen() {
  const { profile } = useAuth();
  const { courses, todos } = useProductivity();
  const {
    acceptInvitation,
    declineInvitation,
    error: networkError,
    incomingInvitations,
    isLoading,
    outgoingInvitations,
    sendInvitation,
    trophyRooms,
  } = usePortfolioNetwork();
  const [activeTab, setActiveTab] = useState<TrophyTab>("mine");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState(
    "I’d love for you to see the learning trophies I’m building in Align Everyday.",
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const completed = courses.filter((course) => course.status === "completed");
  const shipped = todos.filter((todo) => todo.is_completed).length;
  const learningSeconds = courses.reduce(
    (total, course) => total + course.current_progress_sec,
    0,
  );
  const publicUrl = useMemo(() => {
    if (!profile?.username) return null;
    return Linking.createURL(`/portfolio/${profile.username}`);
  }, [profile?.username]);
  const pendingIncoming = incomingInvitations.filter(
    (invitation) => invitation.status === "pending",
  );

  async function sharePublicPortfolio() {
    if (!publicUrl) {
      setActionError("Add a username before sharing your trophy room.");
      return;
    }

    try {
      await Share.share({
        title: "View my Align Everyday trophy room",
        message: `Here’s my Align Everyday trophy room: ${publicUrl}`,
        url: publicUrl,
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function sendAndEmailInvitation() {
    setActionError(null);
    setIsSending(true);
    try {
      await sendInvitation(inviteEmail, inviteMessage);
      const body = encodeURIComponent(
        `${inviteMessage}\n\nOpen my trophy room here:\n${publicUrl ?? "Open Align Everyday and check your invitations."}`,
      );
      const subject = encodeURIComponent(
        "You’re invited to my Align Everyday trophy room",
      );
      const mailtoUrl = `mailto:${inviteEmail.trim()}?subject=${subject}&body=${body}`;
      const canOpenMail = await Linking.canOpenURL(mailtoUrl);
      if (canOpenMail) await Linking.openURL(mailtoUrl);
      else {
        await Share.share({
          title: "Align Everyday trophy room invitation",
          message: `${inviteMessage}\n\n${publicUrl ?? ""}`,
        });
      }
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

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
              {profile?.portfolio_public ? "PUBLIC" : "INVITE ONLY"}
            </Text>
          </View>
        </View>

        <Text className="mt-10 text-sm font-semibold uppercase tracking-[3px] text-accent">
          TROPHY ROOM
        </Text>
        <Text className="mt-4 text-5xl font-extrabold leading-[54px] tracking-tight text-cream">
          Learning,{`\n`}made visible.
        </Text>
        <Text className="mt-5 max-w-md text-lg leading-7 text-muted">
          {profile?.bio ||
            "A living record of self-directed education and the work it produced."}
        </Text>

        <View className="mt-8 flex-row gap-3">
          <Pressable
            className="flex-1 items-center rounded-2xl bg-accent px-4 py-4 active:bg-orange-400"
            onPress={() => setIsInviteOpen(true)}
          >
            <Text className="font-bold text-black">Invite friends</Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-2xl bg-surface px-4 py-4 active:opacity-70"
            onPress={() => void sharePublicPortfolio()}
          >
            <Text className="font-bold text-cream">Share link</Text>
          </Pressable>
        </View>

        {actionError || networkError ? (
          <View className="mt-5 rounded-2xl bg-red-500/10 p-4">
            <Text className="font-bold text-red-400">That didn’t work.</Text>
            <Text className="mt-1 text-sm leading-5 text-zinc-300">
              {actionError ?? networkError}
            </Text>
          </View>
        ) : null}

        {pendingIncoming.length > 0 ? (
          <View className="mt-7 rounded-[28px] bg-surface p-5">
            <Text className="text-lg font-extrabold text-cream">
              Trophy room invitations
            </Text>
            <View className="mt-4 gap-4">
              {pendingIncoming.map((invitation) => (
                <View key={invitation.id}>
                  {invitation.inviterProfile ? (
                    <ProfileBadge profile={invitation.inviterProfile} />
                  ) : (
                    <Text className="font-bold text-cream">
                      Someone invited you
                    </Text>
                  )}
                  {invitation.message ? (
                    <Text className="mt-3 text-sm leading-5 text-muted">
                      “{invitation.message}”
                    </Text>
                  ) : null}
                  <View className="mt-4 flex-row gap-3">
                    <Pressable
                      className="flex-1 items-center rounded-2xl bg-accent px-4 py-3"
                      onPress={() => void acceptInvitation(invitation.id)}
                    >
                      <Text className="font-bold text-black">Accept</Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 items-center rounded-2xl bg-elevated px-4 py-3"
                      onPress={() => void declineInvitation(invitation.id)}
                    >
                      <Text className="font-bold text-muted">Decline</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-10 flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-surface p-5">
            <Text className="text-3xl font-extrabold text-accent">
              {completed.length}
            </Text>
            <Text className="mt-2 text-xs leading-4 text-muted">
              Trophies earned
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

        <View className="mt-10 flex-row rounded-full bg-surface p-1">
          {(["mine", "friends"] as TrophyTab[]).map((tab) => {
            const selected = activeTab === tab;
            return (
              <Pressable
                className={`flex-1 items-center rounded-full px-4 py-3 ${
                  selected ? "bg-accent" : ""
                }`}
                key={tab}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  className={`font-bold ${
                    selected ? "text-black" : "text-muted"
                  }`}
                >
                  {tab === "mine" ? "My trophies" : "Friends"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "mine" ? (
          <View className="mt-6 gap-4">
            {completed.map((course) => (
              <TrophyCard course={course} key={course.id} />
            ))}
            {completed.length === 0 ? (
              <View className="rounded-[28px] bg-surface p-7">
                <Text className="text-xl font-bold text-cream">
                  Your first trophy starts now.
                </Text>
                <Text className="mt-2 text-base leading-6 text-muted">
                  Complete a learning path and it will become the first chapter
                  in this trophy room.
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="mt-6 gap-5">
            {isLoading ? (
              <Text className="text-muted">Loading friends’ trophies…</Text>
            ) : null}
            {trophyRooms.map((room) => (
              <View
                className="rounded-[30px] bg-surface p-5"
                key={room.profile.id}
              >
                <ProfileBadge profile={room.profile} />
                <Text className="mt-5 text-sm font-bold uppercase tracking-[2px] text-accent">
                  {room.trophies.length} trophies
                </Text>
                <View className="mt-4 gap-3">
                  {room.trophies.slice(0, 3).map((course) => (
                    <View
                      className="rounded-2xl bg-elevated p-4"
                      key={course.id}
                    >
                      <Text className="font-bold text-cream">
                        {course.title}
                      </Text>
                      <Text className="mt-1 text-xs text-muted">
                        {course.platform} · Completed
                      </Text>
                    </View>
                  ))}
                  {room.trophies.length === 0 ? (
                    <Text className="text-sm leading-5 text-muted">
                      No trophies shared yet. Their completed courses will
                      appear here.
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
            {trophyRooms.length === 0 && !isLoading ? (
              <View className="rounded-[28px] bg-surface p-7">
                <Text className="text-xl font-bold text-cream">
                  Your circle is waiting.
                </Text>
                <Text className="mt-2 text-base leading-6 text-muted">
                  Invite friends or accept an invitation to see their trophy
                  rooms here.
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {outgoingInvitations.filter((invite) => invite.status === "pending")
          .length > 0 ? (
          <Text className="mt-8 text-sm leading-5 text-muted">
            {
              outgoingInvitations.filter(
                (invite) => invite.status === "pending",
              ).length
            }{" "}
            invitation
            {outgoingInvitations.filter((invite) => invite.status === "pending")
              .length === 1
              ? ""
              : "s"}{" "}
            pending.
          </Text>
        ) : null}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setIsInviteOpen(false)}
        statusBarTranslucent
        transparent
        visible={isInviteOpen}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <Pressable
            accessibilityLabel="Close invite sheet"
            className="absolute inset-0 bg-black/80"
            onPress={() => setIsInviteOpen(false)}
          />
          <View className="rounded-t-[34px] bg-surface px-6 pb-10 pt-4">
            <View className="mx-auto mb-7 h-1.5 w-16 rounded-full bg-zinc-500" />
            <Text className="text-3xl font-extrabold tracking-tight text-cream">
              Invite to trophy room
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              They’ll receive an email draft now, and if they join with this
              email, the invitation appears in-app too.
            </Text>

            <Text className="mb-2 mt-6 text-sm font-semibold text-zinc-300">
              Email address
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-2xl bg-elevated px-5 py-4 text-base text-cream"
              keyboardType="email-address"
              onChangeText={setInviteEmail}
              placeholder="friend@example.com"
              placeholderTextColor="#737373"
              selectionColor="#FF9D00"
              value={inviteEmail}
            />

            <Text className="mb-2 mt-5 text-sm font-semibold text-zinc-300">
              Message
            </Text>
            <TextInput
              className="min-h-24 rounded-2xl bg-elevated px-5 py-4 text-base text-cream"
              multiline
              onChangeText={setInviteMessage}
              placeholder="Add a note"
              placeholderTextColor="#737373"
              selectionColor="#FF9D00"
              textAlignVertical="top"
              value={inviteMessage}
            />

            <Pressable
              className={`mt-7 items-center rounded-2xl bg-accent px-6 py-5 ${
                isSending ? "opacity-50" : "active:bg-orange-400"
              }`}
              disabled={isSending}
              onPress={() => void sendAndEmailInvitation()}
            >
              <Text className="text-lg font-bold text-black">
                {isSending ? "Sending…" : "Create invite + open email"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
