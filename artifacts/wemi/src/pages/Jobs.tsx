import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Clock, BookMarked } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/Mascot";
import { JOBS, JOB_CATEGORIES, type JobCategory } from "@/data/jobs";
import { cn } from "@/lib/utils";

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<JobCategory | "전체">("전체");

  const filtered = useMemo(() => {
    return JOBS.filter((j) => {
      if (category !== "전체" && j.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const blob = `${j.title} ${j.description} ${j.highlights.join(" ")} ${j.recommendedMajors.join(" ")}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [query, category]);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-8 border-b border-border/60"
      >
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
            Jobs
          </p>
          <h1 className="mt-2 text-4xl lg:text-5xl font-extrabold tracking-tight">직무 학습</h1>
          <p className="mt-3 text-muted-foreground">
            인문계 친화도가 높은 진로를 모았어요. 마음에 드는 직무를 골라 깊이 들여다보세요.
          </p>
        </div>
        <Mascot size={84} animate="bob" className="hidden sm:block" />
      </motion.div>

      {/* Filters */}
      <div className="mt-8 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative lg:w-96">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="직무·키워드로 찾기"
            className="h-12 pl-11 rounded-2xl bg-card"
          />
        </div>

        <div className="flex-1 -mx-6 lg:mx-0 px-6 lg:px-0 overflow-x-auto">
          <div className="flex gap-2 w-max lg:flex-wrap pb-1">
            <Chip
              active={category === "전체"}
              onClick={() => setCategory("전체")}
              label="전체"
            />
            {JOB_CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
                label={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="mt-6 text-sm text-muted-foreground">
        총 <span className="font-bold text-foreground">{filtered.length}개</span>의 직무
      </p>

      {/* Grid */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((job, i) => (
          <motion.article
            key={job.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className="rounded-3xl bg-card border border-card-border p-6 hover-elevate flex flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30"
                  style={{ color: "hsl(88 45% 32%)" }}
                >
                  {job.category}
                </span>
                <span className="ml-2 text-[11px] text-muted-foreground font-medium">
                  {job.level}
                </span>
              </div>
              <div className="flex flex-col items-center shrink-0 px-2.5 py-1.5 rounded-xl bg-primary/15">
                <span className="text-[10px] font-bold tracking-wide" style={{ color: "hsl(35 60% 30%)" }}>
                  적합도
                </span>
                <span className="text-lg font-extrabold leading-none mt-0.5" style={{ color: "hsl(35 60% 25%)" }}>
                  {job.fitScore}
                </span>
              </div>
            </div>

            <h3 className="mt-4 text-xl font-extrabold tracking-tight">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {job.highlights.map((h) => (
                <span
                  key={h}
                  className="text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {h}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/60 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <BookMarked size={13} />
                콘텐츠 {job.contentCount}개
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />약 {job.estimatedHours}시간
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} />
                {job.recommendedMajors[0]} 외
              </span>
            </div>
          </motion.article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 rounded-3xl bg-card border border-card-border mt-4">
          <Mascot size={96} animate="bob" />
          <p className="mt-4 font-semibold text-lg">아직 딱 맞는 직무가 없어요</p>
          <p className="text-sm text-muted-foreground mt-1">
            다른 키워드나 분야를 골라볼까요?
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-card text-muted-foreground border-border hover-elevate",
      )}
    >
      {label}
    </button>
  );
}
