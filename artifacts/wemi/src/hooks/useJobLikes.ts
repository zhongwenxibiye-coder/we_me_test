import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const GUEST_KEY = "wemi-guest-job-likes";

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

export function useJobLikes() {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const fetchLikes = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) { setInitialized(true); return; }

    const { data: allData } = await supabase.from("job_likes").select("job_id");
    if (allData) {
      const counts: Record<string, number> = {};
      allData.forEach(({ job_id }: { job_id: string }) => {
        counts[job_id] = (counts[job_id] ?? 0) + 1;
      });
      setLikes(counts);
    }

    if (user) {
      const { data: myData } = await supabase
        .from("job_likes").select("job_id").eq("user_id", user.id);
      if (myData) setUserLikes(new Set(myData.map((l: { job_id: string }) => l.job_id)));
    } else {
      setUserLikes(getGuestLikes());
    }
    setInitialized(true);
  }, [user]);

  useEffect(() => { void fetchLikes(); }, [fetchLikes]);

  const toggleLike = useCallback(async (jobId: string | number) => {
    const id = String(jobId);
    const liked = userLikes.has(id);

    if (user) {
      // 회원: Supabase에 저장
      const supabase = getSupabase();
      if (!supabase) return;
      if (liked) {
        setUserLikes(prev => { const s = new Set(prev); s.delete(id); return s; });
        setLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
        await supabase.from("job_likes").delete().eq("user_id", user.id).eq("job_id", id);
      } else {
        setUserLikes(prev => new Set([...prev, id]));
        setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
        await supabase.from("job_likes").insert({ user_id: user.id, job_id: id });
      }
    } else {
      // 비회원: localStorage에 저장
      const guestLikes = getGuestLikes();
      if (liked) {
        guestLikes.delete(id);
        setUserLikes(prev => { const s = new Set(prev); s.delete(id); return s; });
        setLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
      } else {
        guestLikes.add(id);
        setUserLikes(prev => new Set([...prev, id]));
        setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      }
      saveGuestLikes(guestLikes);
    }
  }, [user, userLikes]);

  return { likes, userLikes, initialized, toggleLike, refetch: fetchLikes };
}
