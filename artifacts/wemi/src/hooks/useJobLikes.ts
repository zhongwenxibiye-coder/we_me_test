import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
    }
    setInitialized(true);
  }, [user]);

  useEffect(() => { void fetchLikes(); }, [fetchLikes]);

  const toggleLike = useCallback(async (jobId: string | number) => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    const id = String(jobId);
    const liked = userLikes.has(id);

    if (liked) {
      setUserLikes(prev => { const s = new Set(prev); s.delete(id); return s; });
      setLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
      await supabase.from("job_likes").delete().eq("user_id", user.id).eq("job_id", id);
    } else {
      setUserLikes(prev => new Set([...prev, id]));
      setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      await supabase.from("job_likes").insert({ user_id: user.id, job_id: id });
    }
  }, [user, userLikes]);

  return { likes, userLikes, initialized, toggleLike, refetch: fetchLikes };
}
