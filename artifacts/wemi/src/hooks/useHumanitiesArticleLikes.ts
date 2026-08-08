import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const GUEST_KEY = "wemi-guest-article-likes";

function getGuestLikedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveGuestLikedIds(s: Set<number>) {
  localStorage.setItem(GUEST_KEY, JSON.stringify([...s]));
}

export function useHumanitiesArticleLikes(articleId?: number) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchLikes = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || articleId === undefined) { setInitialized(true); return; }

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
      } else {
        // 비회원: localStorage 확인
        setLiked(getGuestLikedIds().has(articleId));
      }
    } catch {
      // 테이블이 없으면 조용히 무시
      if (!user && articleId !== undefined) {
        setLiked(getGuestLikedIds().has(articleId));
      }
    }
    setInitialized(true);
  }, [articleId, user]);

  useEffect(() => { void fetchLikes(); }, [fetchLikes]);

  const toggleLike = useCallback(async () => {
    if (articleId === undefined) return;

    if (user) {
      // 회원: Supabase에 저장
      const supabase = getSupabase();
      if (!supabase) return;
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
        void fetchLikes();
      }
    } else {
      // 비회원: localStorage에 저장
      const guestLikes = getGuestLikedIds();
      if (liked) {
        guestLikes.delete(articleId);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        guestLikes.add(articleId);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
      saveGuestLikedIds(guestLikes);
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

export function useAllHumanitiesArticleViews() {
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        const { data } = await supabase
          .from("humanities_article_views")
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
