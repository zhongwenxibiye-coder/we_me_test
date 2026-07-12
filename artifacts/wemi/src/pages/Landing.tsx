import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mascot, WemiWordmark } from "@/components/Mascot";
import { QuizSection } from "@/components/QuizSection";
import { useListStartupPosts, useListHumanitiesArticles, useListCreativeWorks } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Rocket, BookOpen, PenLine, Users, ArrowRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

interface CommunityPost {
  id: string;
  title: string;
  nickname: string | null;
  created_at: string;
}

export default function Landing() {
  const { data: startupPosts = [] } = useListStartupPosts();
  const { data: articles = [] } = useListHumanitiesArticles();
  const { data: works = [] } = useListCreativeWorks();
  const [communityPost, setCommunityPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase
      .from("posts")
      .select("id, title, nickname, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setCommunityPost(data as CommunityPost); });
  }, []);

  const latestPost = startupPosts[0];
  const latestArticle = articles[0];
  const latestWork = works[0];

  const cards = [
    {
      icon: <Rocket size={16} />,
      label: "창업 프로젝트",
      href: "/career-match",
      title: latestPost?.title ?? null,
      sub: latestPost?.organizationName ?? null,
      badge: latestPost ? (latestPost.isActive ? "진행중" : "마감") : null,
      badgeColor: latestPost?.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
      color: "hsl(45 92% 45%)",
      bg: "hsl(45 85% 93%)",
    },
    {
      icon: <BookOpen size={16} />,
      label: "인문학 콘텐츠",
      href: "/humanities",
      title: latestArticle?.title ?? null,
      sub: latestArticle?.authorName ?? null,
      badge: latestArticle?.category ?? null,
      badgeColor: "bg-primary/15 text-foreground",
      color: "hsl(88 50% 38%)",
      bg: "hsl(88 35% 92%)",
    },
    {
      icon: <PenLine size={16} />,
      label: "창작 공간",
      href: "/creative-space",
      title: latestWork?.title ?? null,
      sub: latestWork?.category ?? null,
      badge: null,
      badgeColor: "",
      color: "hsl(200 65% 38%)",
      bg: "hsl(200 45% 92%)",
    },
    {
      icon: <Users size={16} />,
      label: "커뮤니티",
      href: "/community",
      title: communityPost?.title ?? null,
      sub: communityPost?.nickname ?? null,
      badge: null,
      badgeColor: "",
      color: "hsl(280 50% 45%)",
      bg: "hsl(280 35% 93%)",
    },
  ];

  return (
    <div>
      {/* ① 히어로 */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(45 90% 80%) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute top-32 -left-40 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(88 60% 75%) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 pt-10 pb-6 lg:pt-20 lg:pb-10 grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground/80 leading-snug">
              인문계열을 위한 취업 플랫폼
            </p>
            <h1
              className="mt-2 text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none"
              style={{
                background: "linear-gradient(135deg, hsl(45 95% 50%), hsl(35 90% 55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              위미
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              전공에 얽매이지 않고 진로의 폭을 넓혀보세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 18 }}
            className="relative flex flex-col items-center justify-center min-h-[180px] sm:min-h-[240px]"
          >
            <Mascot size={160} animate="float" />
            <div className="mt-1">
              <WemiWordmark height={44} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ② 최신글 + ③ 퀴즈 — 나란히 */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-6 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-8 items-stretch"
        >
          {/* 왼쪽: 최신글 2×2 */}
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold tracking-tight mb-3">최신글</h2>
            <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1">
              {cards.map((card) => (
                <Link key={card.label} href={card.href}>
                  <div className="rounded-2xl border border-border bg-card hover:shadow-md transition-shadow p-4 h-full cursor-pointer group">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="size-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: card.bg, color: card.color }}
                      >
                        {card.icon}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{card.label}</span>
                      <ArrowRight size={10} className="ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    {card.title ? (
                      <>
                        <p className="font-bold text-xs leading-snug line-clamp-2">{card.title}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {card.badge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                              {card.badge}
                            </span>
                          )}
                          {card.sub && <span className="text-[10px] text-muted-foreground truncate">{card.sub}</span>}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">곧 새 콘텐츠가 올라와요</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 오른쪽: 오늘의 퀴즈 */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-base font-extrabold tracking-tight">오늘의 인문학 퀴즈</h2>
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "hsl(45 80% 40%)" }}>
                Daily Quiz
              </span>
            </div>
            <QuizSection />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
