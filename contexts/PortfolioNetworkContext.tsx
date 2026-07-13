import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { mockCourses } from "@/data/mock";
import { createActionError } from "@/lib/observability";
import { supabase } from "@/lib/supabase";
import type { Course, PortfolioInvitation, Profile } from "@/types/database";
import type {
  PortfolioInvitationWithProfile,
  TrophyRoom,
} from "@/types/learning";

interface PortfolioNetworkContextValue {
  incomingInvitations: PortfolioInvitationWithProfile[];
  outgoingInvitations: PortfolioInvitationWithProfile[];
  trophyRooms: TrophyRoom[];
  isLoading: boolean;
  error: string | null;
  sendInvitation: (
    inviteeEmail: string,
    message?: string,
  ) => Promise<PortfolioInvitation>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PortfolioNetworkContext =
  createContext<PortfolioNetworkContextValue | null>(null);

const demoFriendProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000099",
  full_name: "Maya Chen",
  username: "mayaships",
  avatar_url: null,
  bio: "Learning in public across design systems, frontend craft, and product thinking.",
  portfolio_public: true,
};

const demoIncomingInvitation: PortfolioInvitationWithProfile = {
  id: "demo-invite-1",
  inviter_id: demoFriendProfile.id,
  invitee_id: null,
  invitee_email: "demo@aligneveryday.app",
  status: "pending",
  message: "Come see what I’ve been building this month.",
  created_at: new Date().toISOString(),
  accepted_at: null,
  declined_at: null,
  inviterProfile: demoFriendProfile,
};

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function decorateInvitations(
  invitations: PortfolioInvitation[],
  profiles: Profile[],
): PortfolioInvitationWithProfile[] {
  const profileById = byId(profiles);
  return invitations.map((invitation) => ({
    ...invitation,
    inviterProfile: profileById.get(invitation.inviter_id) ?? null,
    inviteeProfile: invitation.invitee_id
      ? (profileById.get(invitation.invitee_id) ?? null)
      : null,
  }));
}

export function PortfolioNetworkProvider({ children }: PropsWithChildren) {
  const { email, isAuthenticated, isDemo, userId } = useAuth();
  const [incomingInvitations, setIncomingInvitations] = useState<
    PortfolioInvitationWithProfile[]
  >([]);
  const [outgoingInvitations, setOutgoingInvitations] = useState<
    PortfolioInvitationWithProfile[]
  >([]);
  const [trophyRooms, setTrophyRooms] = useState<TrophyRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function hydrate() {
    if (!isAuthenticated || !userId) {
      setIncomingInvitations([]);
      setOutgoingInvitations([]);
      setTrophyRooms([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (isDemo || !supabase) {
      setIncomingInvitations([demoIncomingInvitation]);
      setOutgoingInvitations([]);
      setTrophyRooms([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const normalizedEmail = email?.trim().toLowerCase();

    const [outgoingResult, incomingResult] = await Promise.all([
      supabase
        .from("portfolio_invitations")
        .select("*")
        .eq("inviter_id", userId),
      normalizedEmail
        ? supabase
            .from("portfolio_invitations")
            .select("*")
            .or(`invitee_id.eq.${userId},invitee_email.eq.${normalizedEmail}`)
        : supabase
            .from("portfolio_invitations")
            .select("*")
            .eq("invitee_id", userId),
    ]);

    if (outgoingResult.error || incomingResult.error) {
      setIsLoading(false);
      const syncError = createActionError(
        outgoingResult.error ?? incomingResult.error,
        { entity: "portfolio_invitation", operation: "hydrate" },
        "We couldn’t sync your trophy room invitations.",
      );
      setError(syncError.message);
      return;
    }

    const invitations = [
      ...(outgoingResult.data ?? []),
      ...(incomingResult.data ?? []),
    ];
    const uniqueInvitations = Array.from(byId(invitations).values());
    const profileIds = Array.from(
      new Set(
        uniqueInvitations
          .flatMap((invitation) => [
            invitation.inviter_id,
            invitation.invitee_id,
          ])
          .filter(Boolean) as string[],
      ),
    );

    const profileResult =
      profileIds.length > 0
        ? await supabase.from("profiles").select("*").in("id", profileIds)
        : { data: [], error: null };

    if (profileResult.error) {
      setIsLoading(false);
      const syncError = createActionError(
        profileResult.error,
        { entity: "profile", operation: "hydrate_trophy_profiles" },
        "We couldn’t load trophy room profiles.",
      );
      setError(syncError.message);
      return;
    }

    const decorated = decorateInvitations(
      uniqueInvitations,
      profileResult.data ?? [],
    );
    setIncomingInvitations(
      decorated.filter((invitation) => invitation.inviter_id !== userId),
    );
    setOutgoingInvitations(
      decorated.filter((invitation) => invitation.inviter_id === userId),
    );

    const acceptedInviterIds = decorated
      .filter(
        (invitation) =>
          invitation.status === "accepted" && invitation.inviter_id !== userId,
      )
      .map((invitation) => invitation.inviter_id);

    if (acceptedInviterIds.length === 0) {
      setTrophyRooms([]);
      setIsLoading(false);
      return;
    }

    const [roomsProfileResult, trophiesResult] = await Promise.all([
      supabase.from("profiles").select("*").in("id", acceptedInviterIds),
      supabase
        .from("courses")
        .select("*")
        .in("user_id", acceptedInviterIds)
        .eq("status", "completed"),
    ]);

    setIsLoading(false);

    if (roomsProfileResult.error || trophiesResult.error) {
      const syncError = createActionError(
        roomsProfileResult.error ?? trophiesResult.error,
        { entity: "trophy_room", operation: "hydrate" },
        "We couldn’t load friends’ trophy rooms.",
      );
      setError(syncError.message);
      return;
    }

    const trophiesByUser = (trophiesResult.data ?? []).reduce<
      Record<string, Course[]>
    >((acc, course) => {
      acc[course.user_id] = [...(acc[course.user_id] ?? []), course];
      return acc;
    }, {});

    setTrophyRooms(
      (roomsProfileResult.data ?? []).map((profile) => ({
        profile,
        trophies: trophiesByUser[profile.id] ?? [],
      })),
    );
  }

  useEffect(() => {
    void hydrate();
  }, [email, isAuthenticated, isDemo, userId]);

  const value = useMemo<PortfolioNetworkContextValue>(
    () => ({
      incomingInvitations,
      outgoingInvitations,
      trophyRooms,
      isLoading,
      error,
      async sendInvitation(inviteeEmail, message) {
        if (!userId) throw new Error("Sign in to invite someone.");
        const normalizedEmail = inviteeEmail.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
          throw new Error("Enter a valid email address.");
        }

        const invitationInput: PortfolioInvitation = {
          id: `local-invite-${Date.now()}`,
          inviter_id: userId,
          invitee_id: null,
          invitee_email: normalizedEmail,
          status: "pending",
          message: message?.trim() || null,
          created_at: new Date().toISOString(),
          accepted_at: null,
          declined_at: null,
        };

        if (isDemo || !supabase) {
          setOutgoingInvitations((current) => [invitationInput, ...current]);
          return invitationInput;
        }

        const { data, error: mutationError } = await supabase
          .from("portfolio_invitations")
          .insert({
            ...invitationInput,
            id: undefined,
          })
          .select("*")
          .single();

        if (mutationError) {
          const actionError = createActionError(
            mutationError,
            { entity: "portfolio_invitation", operation: "create" },
            "We couldn’t create that invitation. Try again.",
          );
          setError(actionError.message);
          throw actionError;
        }
        await hydrate();
        return data;
      },
      async acceptInvitation(invitationId) {
        if (!userId) throw new Error("Sign in to accept invitations.");
        const acceptedAt = new Date().toISOString();
        if (isDemo || !supabase) {
          const acceptedInvitation = incomingInvitations.find(
            (invitation) => invitation.id === invitationId,
          );
          setIncomingInvitations((current) =>
            current.map((invitation) =>
              invitation.id === invitationId
                ? {
                    ...invitation,
                    invitee_id: userId,
                    status: "accepted",
                    accepted_at: acceptedAt,
                    declined_at: null,
                  }
                : invitation,
            ),
          );
          if (acceptedInvitation?.inviterProfile) {
            setTrophyRooms((current) => [
              {
                profile: acceptedInvitation.inviterProfile!,
                trophies: [
                  {
                    ...mockCourses[0],
                    id: "maya-system-design",
                    user_id: acceptedInvitation.inviter_id,
                    title: "System Design for Frontend Engineers",
                    status: "completed",
                    current_progress_sec: 18000,
                    total_duration_sec: 18000,
                  },
                ],
              },
              ...current,
            ]);
          }
          return;
        }

        const { error: mutationError } = await supabase
          .from("portfolio_invitations")
          .update({
            invitee_id: userId,
            status: "accepted",
            accepted_at: acceptedAt,
            declined_at: null,
          })
          .eq("id", invitationId);
        if (mutationError) {
          const actionError = createActionError(
            mutationError,
            { entity: "portfolio_invitation", operation: "accept" },
            "We couldn’t accept that invitation.",
          );
          setError(actionError.message);
          throw actionError;
        }
        await hydrate();
      },
      async declineInvitation(invitationId) {
        if (!userId) throw new Error("Sign in to decline invitations.");
        const declinedAt = new Date().toISOString();
        if (isDemo || !supabase) {
          setIncomingInvitations((current) =>
            current.map((invitation) =>
              invitation.id === invitationId
                ? {
                    ...invitation,
                    invitee_id: userId,
                    status: "declined",
                    accepted_at: null,
                    declined_at: declinedAt,
                  }
                : invitation,
            ),
          );
          return;
        }

        const { error: mutationError } = await supabase
          .from("portfolio_invitations")
          .update({
            invitee_id: userId,
            status: "declined",
            accepted_at: null,
            declined_at: declinedAt,
          })
          .eq("id", invitationId);
        if (mutationError) {
          const actionError = createActionError(
            mutationError,
            { entity: "portfolio_invitation", operation: "decline" },
            "We couldn’t decline that invitation.",
          );
          setError(actionError.message);
          throw actionError;
        }
        await hydrate();
      },
      refresh: hydrate,
    }),
    [
      error,
      incomingInvitations,
      isDemo,
      isLoading,
      outgoingInvitations,
      trophyRooms,
      userId,
    ],
  );

  return (
    <PortfolioNetworkContext.Provider value={value}>
      {children}
    </PortfolioNetworkContext.Provider>
  );
}

export function usePortfolioNetwork(): PortfolioNetworkContextValue {
  const context = useContext(PortfolioNetworkContext);
  if (!context) {
    throw new Error(
      "usePortfolioNetwork must be used inside PortfolioNetworkProvider.",
    );
  }
  return context;
}
