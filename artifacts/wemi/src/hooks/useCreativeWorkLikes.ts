import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const GUEST_KEY = "wemi-guest-creative-likes";

function getGuestLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveGuestLikes(s: Set<string>) {
  localStorage.setItem(GUEST_KEY, JSON.stringify([...s]));
}

export function useCreativeWorkLikes() {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const fetchLikes = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) { setInitialized(true); return; }

    const { data: allData } = await supabase.from("creative_work_likes").select("work_id");
    if (allData) {
      const counts: Record<string, number> = {};
      allData.forEach(({ work_id }: { work_id: string }) => {
        counts[work_id] = (counts[work_id] ?? 0) + 1;
      });
      setLikes(counts);
    }

    if (user) {
      const { data: myData } = await supabase
        .from("creative_work_likes").select("work_id").eq("user_id", user.id);
      if (myData) setUserLikes(new Set(myData.map((l: { work_id: string }) => l.work_id)));
    } else {
      setUserLikes(getGuestLikes());
    }
    setInitialized(true);
  }, [user]);

  useEffect(() => { void fetchLikes(); }, [fetchLikes]);

  const toggleLike = useCallback(async (workId: string | number) => {
    const id = String(workId);
    const liked = userLikes.has(id);

    if (user) {
      // 회원: Supabase에 저장
      const supabase = getSupabase();
      if (!supabase) return;
      if (liked) {
        setUserLikes(prev => { const s = new Set(prev); s.delete(id); return s; });
        setLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
        await supabase.from("creative_work_likes").delete().eq("user_id", user.id).eq("work_id", id);
      } else {
        setUserLikes(prev => new Set([...prev, id]));
        setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
        await supabase.from("creative_work_likes").insert({ user_id: user.id, work_id: id });
      }
    } else {
      // 비회원: localStorage에 저장
      const guestLikes = getGuestLikes();
      if (liked) {
        guestLikes.delete(id);
        setUserLikes(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        guestLikes.add(id);
        setUserLikes(prev => new Set([...prev, id]));
      }
      saveGuestLikes(guestLikes);
    }
  }, [user, userLikes]);

  return { likes, userLikes, initialized, toggleLike, refetch: fetchLikes };
}
