import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nickname: string | null;
  department: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  nickname: null,
  department: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("nickname, department")
      .eq("id", userId)
      .single();
    const profile = data as { nickname: string; department: string } | null;
    setNickname(profile?.nickname ?? null);
    setDepartment(profile?.department ?? null);
  }, []);

  const ensureProfile = useCallback(async (user: User) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const metadataNickname = user.user_metadata?.nickname;
    if (typeof metadataNickname === "string" && metadataNickname.trim()) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        // 가입 직후 이메일 인증으로 세션이 없었던 경우, 첫 로그인 때
        // 인증된 사용자 세션으로 프로필을 생성한다.
        await supabase.from("profiles").insert({
          id: user.id,
          nickname: metadataNickname.trim(),
        });
      }
    }

    await fetchProfile(user.id);
  }, [fetchProfile]);

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
      if (data.session?.user) void ensureProfile(data.session.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) void ensureProfile(s.user);
      else setNickname(null);
    });
    return () => listener.subscription.unsubscribe();
  }, [ensureProfile]);

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    setNickname(null);
    setDepartment(null);
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, nickname, department, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
