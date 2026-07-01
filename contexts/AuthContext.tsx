import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const demoProfile: Profile = {
  id: DEMO_USER_ID,
  full_name: 'Alex Morgan',
  username: 'alexbuilds',
  avatar_url: null,
  bio: 'Building visible proof of self-directed learning.',
  portfolio_public: true,
};

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

interface ProfileInput {
  fullName: string;
  username: string;
  bio: string;
  portfolioPublic: boolean;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  userId: string | null;
  email: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemo: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

WebBrowser.maybeCompleteAuthSession();

async function consumeAuthRedirect(url: string) {
  if (!supabase) return;
  const normalized = url.replace('#', '?');
  const query = normalized.split('?')[1];
  if (!query) return;

  const params = new URLSearchParams(query);
  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  async function hydrateProfile(userId: string) {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data);
  }

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session) await hydrateProfile(data.session.user.id);
      if (isMounted) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        setIsLoading(true);
        setTimeout(() => {
          void hydrateProfile(nextSession.user.id).finally(() => setIsLoading(false));
        }, 0);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    void Linking.getInitialURL().then((url) => {
      if (url) void consumeAuthRedirect(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void consumeAuthRedirect(url);
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const userId = isDemo ? DEMO_USER_ID : (session?.user.id ?? null);
    const activeProfile = isDemo ? (profile ?? demoProfile) : profile;

    return {
      session,
      profile: activeProfile,
      userId,
      email: isDemo ? 'demo@aligneveryday.app' : (session?.user.email ?? null),
      isLoading,
      isAuthenticated: isDemo || Boolean(session),
      isDemo,
      needsOnboarding:
        !isDemo && Boolean(session) && (!profile?.full_name || !profile?.username),
      async signIn(email, password) {
        if (!supabase) throw new Error('Supabase is not configured. Use demo mode for now.');
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw new Error(error.message);
      },
      async signInWithGoogle() {
        if (!supabase) throw new Error('Supabase is not configured. Use demo mode for now.');

        const redirectTo = Linking.createURL('/onboarding');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: Platform.OS !== 'web',
          },
        });
        if (error) throw new Error(error.message);

        if (Platform.OS !== 'web') {
          if (!data.url) throw new Error('Google sign-in could not be started.');
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success') await consumeAuthRedirect(result.url);
        }
      },
      async signUp(input) {
        if (!supabase) throw new Error('Supabase is not configured. Use demo mode for now.');
        const { data, error } = await supabase.auth.signUp({
          email: input.email.trim().toLowerCase(),
          password: input.password,
          options: {
            data: { full_name: input.fullName.trim() },
            emailRedirectTo: Linking.createURL('/onboarding'),
          },
        });
        if (error) throw new Error(error.message);
        return { needsEmailConfirmation: !data.session };
      },
      async sendPasswordReset(email) {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: Linking.createURL('/update-password'),
        });
        if (error) throw new Error(error.message);
      },
      async updatePassword(password) {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);
      },
      async updateProfile(input) {
        if (isDemo) {
          setProfile({
            ...demoProfile,
            full_name: input.fullName,
            username: input.username,
            bio: input.bio,
            portfolio_public: input.portfolioPublic,
          });
          return;
        }
        if (!supabase || !session) throw new Error('Your session has expired.');
        const nextProfile: Profile = {
          id: session.user.id,
          full_name: input.fullName.trim(),
          username: input.username.trim().toLowerCase(),
          avatar_url: profile?.avatar_url ?? null,
          bio: input.bio.trim() || null,
          portfolio_public: input.portfolioPublic,
        };
        const { data, error } = await supabase
          .from('profiles')
          .upsert(nextProfile)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        setProfile(data);
      },
      async signOut() {
        if (isDemo) {
          setIsDemo(false);
          setProfile(null);
          return;
        }
        if (supabase) {
          const { error } = await supabase.auth.signOut();
          if (error) throw new Error(error.message);
        }
      },
      enterDemo() {
        setIsDemo(true);
        setIsLoading(false);
      },
    };
  }, [isDemo, isLoading, profile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

export { getErrorMessage };
