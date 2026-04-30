import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, GraduationCap, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/Mascot";
import { MENTORS, MENTOR_FIELDS } from "@/data/mentors";
import { cn } from "@/lib/utils";

export default function Mentors() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState<string>("전체");

  const filtered = useMemo(() => {
    return MENTORS.filter((m) => {
      if (field !== "전체") {
        const expertiseMatch = m.expertise.some((e) => e.includes(field));
        const positionMatch = m.position.includes(field);
        if (!expertiseMatch && !positionMatch) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const blob = `${m.name} ${m.company} ${m.position} ${m.major} ${m.expertise.join(" ")}`.toLowerCase();
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
            placeholder="이름·회사·전공으로 찾기"
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

      {/* Results count */}
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
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold tracking-tight truncate">{mentor.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-semibold shrink-0">
                    <Star size={13} fill="hsl(45 92% 55%)" stroke="hsl(45 92% 55%)" />
                    {mentor.rating}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {mentor.company} · {mentor.position}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap size={12} />
                {mentor.university} {mentor.major}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {mentor.yearsOfExperience}년차
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/85 flex-1">
              "{mentor.bio}"
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {mentor.expertise.map((e) => (
                <span
                  key={e}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/25"
                  style={{ color: "hsl(88 45% 32%)" }}
                >
                  #{e}
                </span>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
              누적 멘토링 {mentor.sessionsCount}회
            </div>
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
