import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Clock, BookMarked } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/Mascot";
import { PageHeader } from "@/components/PageHeader";
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
    <div>
      <PageHeader title="직무 학습" subtitle="인문계 친화도가 높은 진로를 모았어요" />

      <div className="px-5 pt-4 sticky top-[64px] z-20 bg-background/85 backdrop-blur-xl pb-3 border-b border-border/40">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="직무·키워드로 찾기"
            className="h-12 pl-11 rounded-2xl bg-muted/60 border-transparent focus-visible:bg-background"
          />
        </div>

        <div className="mt-3 -mx-5 px-5 overflow-x-auto">
          <div className="flex gap-2 w-max pb-1">
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

      <div className="px-5 pt-4 pb-6 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Mascot size={84} animate="bob" />
            <p className="mt-4 font-semibold">아직 딱 맞는 직무가 없어요</p>
            <p className="text-sm text-muted-foreground mt-1">
              다른 키워드나 분야를 골라볼까요?
            </p>
          </div>
        )}

        {filtered.map((job, i) => (
          <motion.article
            key={job.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className="rounded-3xl bg-card border border-card-border p-5 hover-elevate"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    className="bg-secondary/15 hover:bg-secondary/15 border-secondary/30 font-medium rounded-full px-2.5"
                    style={{ color: "hsl(88 45% 32%)" }}
                  >
                    {job.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {job.level}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold tracking-tight">{job.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {job.description}
                </p>
              </div>
              <div className="flex flex-col items-center shrink-0 px-2 py-2 rounded-2xl bg-primary/15">
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: "hsl(35 60% 30%)" }}>
                  적합도
                </span>
                <span className="text-xl font-extrabold mt-0.5" style={{ color: "hsl(35 60% 25%)" }}>
                  {job.fitScore}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.highlights.map((h) => (
                <span
                  key={h}
                  className="text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {h}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookMarked size={14} />
                콘텐츠 {job.contentCount}개
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />약 {job.estimatedHours}시간
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                {job.recommendedMajors[0]} 외
              </span>
            </div>
          </motion.article>
        ))}
      </div>
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
        "px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-card text-muted-foreground border-border hover-elevate",
      )}
    >
      {label}
    </button>
  );
}
