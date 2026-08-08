import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useHumanitiesArticleLikes(articleId?: number) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchLikes = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) { setInitialized(true); return; }

    if (articleId === undefined) { setInitialized(true); return; }

    try {
      const { data: allData } = await supabase
        .from("humanities_article_likes")
        .select("user_id")
        .eq("article_id", articleId);
      setLikeCount(allData?.length ?? 0);

      if (user) {
        const { data: myData } = await supabase
          .from("humanities_article_likes")
          .select("id")
          .eq("article_id", articleId)
          .eq("user_id", user.id)
          .maybeSingle();
        setLiked(!!myData);
      }
    } catch {
      // Table may not exist yet — silently ignore
    }
    setInitialized(true);
  }, [articleId, user]);

  useEffect(() => { void fetchLikes(); }, [fetchLikes]);

  const toggleLike = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user || articleId === undefined) return;

    try {
      if (liked) {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
        await supabase
          .from("humanities_article_likes")
          .delete()
          .eq("article_id", articleId)
          .eq("user_id", user.id);
      } else {
        setLiked(true);
        setLikeCount((c) => c + 1);
        await supabase
          .from("humanities_article_likes")
          .insert({ article_id: articleId, user_id: user.id });
      }
    } catch {
      // Revert on error
      void fetchLikes();
    }
  }, [articleId, user, liked, fetchLikes]);

  return { likeCount, liked, initialized, toggleLike };
}

export function useAllHumanitiesArticleLikes() {
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        const { data } = await supabase
          .from("humanities_article_likes")
          .select("article_id");
        if (!data) return;
        const c: Record<number, number> = {};
        data.forEach(({ article_id }: { article_id: number }) => {
          c[article_id] = (c[article_id] ?? 0) + 1;
        });
        setCounts(c);
      } catch {}
    })();
  }, []);

  return counts;
}
