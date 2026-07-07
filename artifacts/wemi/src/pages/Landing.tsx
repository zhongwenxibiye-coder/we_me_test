import { motion } from "framer-motion";
import { Mascot, WemiWordmark } from "@/components/Mascot";
import { QuizSection } from "@/components/QuizSection";
import { useListStartupPosts, useListHumanitiesArticles, useListCreativeWorks } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Rocket, BookOpen, PenLine, ArrowRight } from "lucide-react";

function LatestSection() {
  const { data: startupPosts = [] } = useListStartupPosts();
  const { data: articles = [] } = useListHumanitiesArticles();
  const { data: works = [] } = useListCreativeWorks();

  const latestPost = startupPosts[0];
  const latestArticle = articles[0];
  const latestWork = works[0];

  const cards = [
    {
      icon: <Rocket size={18} />,
      label: "창업 프로젝트",
      href: "/career-match",
      title: latestPost?.title ?? null,
      sub: latestPost?.organizationName ?? null,
      badge: latestPost ? (latestPost.isActive ? "진행중" : "마감") : null,
      badgeColor: latestPost?.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
      color: "hsl(45 92% 55%)",
      bg: "hsl(45 60% 97%)",
    },
    {
      icon: <BookOpen size={18} />,
      label: "인문학 콘텐츠",
      href: "/humanities",
      title: latestArticle?.title ?? null,
      sub: latestArticle?.authorName ?? null,
      badge: latestArticle?.category ?? null,
      badgeColor: "bg-primary/15 text-foreground",
      color: "hsl(88 45% 45%)",
      bg: "hsl(88 30% 97%)",
    },
    {
      icon: <PenLine size={18} />,
      label: "창작 공간",
      href: "/creative-space",
      title: latestWork?.title ?? null,
      sub: latestWork?.category ?? null,
      badge: null,
      badgeColor: "",
      color: "hsl(200 60% 45%)",
      bg: "hsl(200 40% 97%)",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-10 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold tracking-tight">위미 최신글</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}>
              <div className="rounded-3xl border border-border bg-card hover:shadow-md transition-shadow p-5 h-full cursor-pointer group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="size-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
                  <ArrowRight size={12} className="ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                {card.title ? (
                  <>
                    <p className="font-extrabold text-sm leading-snug line-clamp-2">{card.title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {card.badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>{card.badge}</span>}
                      {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">곧 새 콘텐츠가 올라와요</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function Landing() {
  return (
    <div>
      {/* Hero */}
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

        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 pt-10 pb-8 lg:pt-24 lg:pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base sm:text-xl lg:text-2xl font-semibold text-foreground/80 leading-snug">
              인문계열을 위한 취업 플랫폼
            </p>
            <h1
              className="mt-3 text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight leading-none"
              style={{
                background: "linear-gradient(135deg, hsl(45 95% 50%), hsl(35 90% 55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              위미
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              전공에 얽매이지 않고 진로의 폭을 넓혀보세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 18 }}
            className="relative flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px]"
          >
            <Mascot size={200} animate="float" />
            <div className="mt-2">
              <WemiWordmark height={56} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 최신글 섹션 */}
      <LatestSection />

      {/* O/X 퀴즈 + 스탬프 바 */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(45 80% 40%)" }}>
            Daily Quiz
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            오늘의 인문학 퀴즈
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">매일 새 퀴즈가 올라와요. 연속 출석으로 스탬프를 모아보세요!</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <QuizSection />
        </motion.div>
      </section>
    </div>
  );
}
