import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { MENTORS, MENTOR_FIELDS } from "@/data/mentors";
import { cn } from "@/lib/utils";

export default function Mentors() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState<(typeof MENTOR_FIELDS)[number]>("전체");

  const filtered = useMemo(() => {
    return MENTORS.filter((m) => {
      if (field !== "전체" && !m.categories.includes(field)) return false;
      if (query) {
        const q = query.toLowerCase();
        const blob = `${m.name} ${m.major} ${m.mentoringFields.join(" ")}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [query, field]);

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
            Mentors
          </p>
          <h1 className="mt-2 text-4xl lg:text-5xl font-extrabold tracking-tight">졸업생 멘토링</h1>
          <p className="mt-3 text-muted-foreground">
            같은 길을 먼저 걸어간 선배들이에요. 편하게 만나 이야기를 나눠보세요.
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
            placeholder="이름·전공으로 찾기"
            className="h-12 pl-11 rounded-2xl bg-card"
          />
        </div>

        <div className="flex-1 -mx-6 lg:mx-0 px-6 lg:px-0 overflow-x-auto">
          <div className="flex gap-2 w-max lg:flex-wrap pb-1">
            {MENTOR_FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setField(f)}
                className={cn(
                  "px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                  field === f
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover-elevate",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        총 <span className="font-bold text-foreground">{filtered.length}명</span>의 멘토
      </p>

      {/* Grid */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mentor, i) => (
          <motion.article
            key={mentor.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className="rounded-3xl bg-card border border-card-border p-6 hover-elevate flex flex-col"
          >
            <div className="flex items-start gap-4">
              <div
                className={`size-16 rounded-2xl ${mentor.avatarColor} flex items-center justify-center text-2xl font-extrabold shrink-0`}
                style={{ color: "hsl(30 50% 25%)" }}
              >
                {mentor.initial}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-extrabold tracking-tight truncate">{mentor.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">멘토링 가능한 직무</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {mentor.mentoringFields.map((f) => (
                    <span
                      key={f}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 font-medium"
                      style={{ color: "hsl(35 60% 25%)" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap size={12} />
                {mentor.major}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {mentor.yearsOfExperience}년차
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/85 flex-1">
              "{mentor.bio}"
            </p>

            <Link href={`/mentors/${mentor.id}`}>
              <Button className="mt-5 w-full rounded-xl h-10 font-semibold">
                자세히 보기 · 신청하기
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </motion.article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 rounded-3xl bg-card border border-card-border mt-4">
          <Mascot size={96} animate="bob" />
          <p className="mt-4 font-semibold text-lg">조건에 맞는 멘토가 아직 없어요</p>
          <p className="text-sm text-muted-foreground mt-1">
            다른 분야나 키워드로 찾아볼까요?
          </p>
        </div>
      )}
    </div>
  );
}
