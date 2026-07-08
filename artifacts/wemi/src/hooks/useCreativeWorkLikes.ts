import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
    }
    setInitialized(true);
  }, [user]);

  useEffect(() => { void fetchLikes(); }, [fetchLikes]);

  const toggleLike = useCallback(async (workId: string | number) => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    const id = String(workId);
    const liked = userLikes.has(id);

    if (liked) {
      setUserLikes(prev => { const s = new Set(prev); s.delete(id); return s; });
      setLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
      await supabase.from("creative_work_likes").delete().eq("user_id", user.id).eq("work_id", id);
    } else {
      setUserLikes(prev => new Set([...prev, id]));
      setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      await supabase.from("creative_work_likes").insert({ user_id: user.id, work_id: id });
    }
  }, [user, userLikes]);

  return { likes, userLikes, initialized, toggleLike, refetch: fetchLikes };
}
