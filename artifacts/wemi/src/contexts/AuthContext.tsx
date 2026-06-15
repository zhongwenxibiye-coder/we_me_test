import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nickname: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  nickname: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .single();
    setNickname((data as { nickname: string } | null)?.nickname ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await fetchProfile(user.id);
  }, [fetchProfile]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void fetchProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) void fetchProfile(s.user.id);
      else setNickname(null);
    });
    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    setNickname(null);
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, nickname, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
