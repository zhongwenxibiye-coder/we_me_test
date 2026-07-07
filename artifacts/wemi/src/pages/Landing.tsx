import { motion } from "framer-motion";
import { useState } from "react";
import { Mascot, WemiWordmark } from "@/components/Mascot";
import { QuizSection } from "@/components/QuizSection";
import { useListStartupPosts, useListHumanitiesArticles, useListCreativeWorks } from "@workspace/api-client-react";
import type { StartupPost, HumanitiesArticle, CreativeWork } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Rocket, BookOpen, PenLine, ArrowRight, Clock } from "lucide-react";

type FeedItem =
  | { kind: "startup"; data: StartupPost }
  | { kind: "humanities"; data: HumanitiesArticle }
  | { kind: "creative"; data: CreativeWork };

const TABS = [
  { id: "all", label: "전체" },
  { id: "startup", label: "창업 프로젝트" },
  { id: "humanities", label: "인문학" },
  { id: "creative", label: "창작 공간" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const META = {
  startup: { icon: <Rocket size={14} />, color: "hsl(45 92% 45%)", bg: "hsl(45 85% 93%)", href: "/career-match", label: "창업 프로젝트" },
  humanities: { icon: <BookOpen size={14} />, color: "hsl(88 50% 38%)", bg: "hsl(88 35% 92%)", href: "/humanities", label: "인문학" },
  creative: { icon: <PenLine size={14} />, color: "hsl(200 65% 38%)", bg: "hsl(200 45% 92%)", href: "/creative-space", label: "창작 공간" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "오늘";
  if (d === 1) return "어제";
  if (d < 7) return `${d}일 전`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}주 전`;
  return `${Math.floor(d / 30)}개월 전`;
}

function FeedCard({ item }: { item: FeedItem }) {
  if (item.kind === "startup") {
    const d = item.data;
    const meta = META.startup;
    return (
      <Link href={meta.href}>
        <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all cursor-pointer group">
          <span className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: meta.bg, color: meta.color }}>
            {meta.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${d.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                {d.isActive ? "진행중" : "마감"}
              </span>
            </div>
            <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{d.title}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {d.organizationName && <span>{d.organizationName}</span>}
              <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(d.createdAt)}</span>
            </div>
          </div>
          <ArrowRight size={14} className="shrink-0 self-center text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    );
  }

  if (item.kind === "humanities") {
    const d = item.data;
    const meta = META.humanities;
    return (
      <Link href={meta.href}>
        <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all cursor-pointer group">
          {d.imageUrl ? (
            <img src={d.imageUrl} alt={d.title} className="size-12 rounded-xl object-cover shrink-0" />
          ) : (
            <span className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: meta.bg, color: meta.color }}>
              {meta.icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
              {d.category && <span className="text-[11px] text-muted-foreground">{d.category}</span>}
            </div>
            <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{d.title}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {d.authorName && <span>{d.authorName}</span>}
              <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(d.createdAt)}</span>
            </div>
          </div>
          <ArrowRight size={14} className="shrink-0 self-center text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    );
  }

  const d = item.data;
  const meta = META.creative;
  return (
    <Link href={meta.href}>
      <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all cursor-pointer group">
        {d.thumbnailUrl ? (
          <img src={d.thumbnailUrl} alt={d.title} className="size-12 rounded-xl object-cover shrink-0" />
        ) : (
          <span className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: meta.bg, color: meta.color }}>
            {meta.icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
            {d.category && <span className="text-[11px] text-muted-foreground">{d.category}</span>}
          </div>
          <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{d.title}</p>
          <span className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />최신 업데이트</span>
        </div>
        <ArrowRight size={14} className="shrink-0 self-center text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

function CommunitySection() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const { data: startupPosts = [] } = useListStartupPosts();
  const { data: articles = [] } = useListHumanitiesArticles();
  const { data: works = [] } = useListCreativeWorks();

  const startupItems: FeedItem[] = startupPosts.slice(0, 5).map((d) => ({ kind: "startup", data: d }));
  const humanitiesItems: FeedItem[] = articles.slice(0, 5).map((d) => ({ kind: "humanities", data: d }));
  const creativeItems: FeedItem[] = works.slice(0, 5).map((d) => ({ kind: "creative", data: d }));

  const allItems: FeedItem[] = [...startupItems, ...humanitiesItems, ...creativeItems]
    .sort((a, b) => {
      const dateA = a.kind === "creative" ? 0 : new Date(a.data.createdAt).getTime();
      const dateB = b.kind === "creative" ? 0 : new Date(b.data.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 8);

  const filtered: FeedItem[] =
    activeTab === "all" ? allItems :
    activeTab === "startup" ? startupItems :
    activeTab === "humanities" ? humanitiesItems :
    creativeItems;

  const moreHref =
    activeTab === "startup" ? "/career-match" :
    activeTab === "humanities" ? "/humanities" :
    activeTab === "creative" ? "/creative-space" : undefined;

  const isEmpty = filtered.length === 0;

  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-10 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">커뮤니티 최신글</h2>
            <p className="text-xs text-muted-foreground mt-0.5">창업 프로젝트 · 인문학 콘텐츠 · 창작 공간의 최신 소식</p>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 rounded-xl p-1 self-start sm:self-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isEmpty ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            아직 등록된 콘텐츠가 없어요 🌱
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((item, i) => (
              <motion.div
                key={`${item.kind}-${item.data.id}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <FeedCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        {moreHref && (
          <div className="mt-5 text-center">
            <Link href={moreHref}>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                전체 보기 <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        )}
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

      {/* 커뮤니티 최신글 */}
      <CommunitySection />

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
