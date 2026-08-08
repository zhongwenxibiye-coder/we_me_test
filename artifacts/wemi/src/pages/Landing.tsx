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
  created_at: string;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  if (diff < 7) return `${diff}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface CardSection {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  bg: string;
  items: { title: string; date: string; badge?: string; badgeColor?: string }[];
}

export default function Landing() {
  const { data: startupPosts = [] } = useListStartupPosts();
  const { data: articles = [] } = useListHumanitiesArticles();
  const { data: works = [] } = useListCreativeWorks();
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase
      .from("posts")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setCommunityPosts(data as CommunityPost[]); });
  }, []);

  const cards: CardSection[] = [
    {
      icon: <Rocket size={15} />,
      label: "창업 프로젝트",
      href: "/career-match",
      color: "hsl(45 92% 38%)",
      bg: "hsl(45 85% 92%)",
      items: startupPosts.slice(0, 5).map((p) => ({
        title: p.title,
        date: fmtDate(p.createdAt),
        badge: p.isActive ? "진행중" : undefined,
        badgeColor: "bg-green-100 text-green-700",
      })),
    },
    {
      icon: <BookOpen size={15} />,
      label: "인문학 콘텐츠",
      href: "/humanities",
      color: "hsl(88 50% 32%)",
      bg: "hsl(88 35% 91%)",
      items: articles.slice(0, 5).map((a) => ({
        title: a.title,
        date: fmtDate(a.createdAt),
        badge: a.category,
        badgeColor: "bg-primary/15 text-foreground/70",
      })),
    },
    {
      icon: <PenLine size={15} />,
      label: "창작 공간",
      href: "/creative-space",
      color: "hsl(200 65% 32%)",
      bg: "hsl(200 45% 91%)",
      items: works.slice(0, 5).map((w) => ({
        title: w.title,
        date: fmtDate(w.createdAt),
        badge: w.category,
        badgeColor: "bg-primary/15 text-foreground/70",
      })),
    },
    {
      icon: <Users size={15} />,
      label: "커뮤니티",
      href: "/community",
      color: "hsl(280 50% 38%)",
      bg: "hsl(280 35% 92%)",
      items: communityPosts.map((p) => ({
        title: p.title,
        date: fmtDate(p.created_at),
      })),
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

      {/* ② 퀴즈(왼쪽) + 최신글(오른쪽) */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-6 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-8 items-stretch"
        >
          {/* 왼쪽: 오늘의 퀴즈 (모바일에서 먼저 보임) */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-base font-extrabold tracking-tight">오늘의 인문학 퀴즈</h2>
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "hsl(45 80% 40%)" }}>
                Daily Quiz
              </span>
            </div>
            <QuizSection />
          </div>

          {/* 오른쪽: 최신글 2×2 */}
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold tracking-tight mb-3">최신글</h2>
            <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1">
              {cards.map((card) => (
                <Link key={card.label} href={card.href}>
                  <div className="rounded-2xl border border-border bg-card hover:shadow-md transition-shadow p-3.5 h-full cursor-pointer group flex flex-col">
                    {/* 카드 헤더 */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span
                        className="size-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: card.bg, color: card.color }}
                      >
                        {card.icon}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground leading-none">{card.label}</span>
                      <ArrowRight size={10} className="ml-auto text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    {/* 글 목록 */}
                    {card.items.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground/60">곧 새 콘텐츠가 올라와요</p>
                    ) : (
                      <ul className="space-y-1.5 flex-1">
                        {card.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 min-w-0">
                            <span className="text-xs font-medium leading-snug flex-1 line-clamp-1 min-w-0">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
                              {item.date}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
