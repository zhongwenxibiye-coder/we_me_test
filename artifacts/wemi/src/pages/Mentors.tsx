import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Star, GraduationCap, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/Mascot";
import { PageHeader } from "@/components/PageHeader";
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
    <div>
      <PageHeader title="졸업생 멘토" subtitle="같은 길을 먼저 걸어간 선배들이에요" />

      <div className="px-5 pt-4 sticky top-[64px] z-20 bg-background/85 backdrop-blur-xl pb-3 border-b border-border/40">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름·회사·전공으로 찾기"
            className="h-12 pl-11 rounded-2xl bg-muted/60 border-transparent focus-visible:bg-background"
          />
        </div>

        <div className="mt-3 -mx-5 px-5 overflow-x-auto">
          <div className="flex gap-2 w-max pb-1">
            {MENTOR_FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setField(f)}
                className={cn(
                  "px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
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

      <div className="px-5 pt-4 pb-6 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Mascot size={84} animate="bob" />
            <p className="mt-4 font-semibold">조건에 맞는 멘토가 아직 없어요</p>
            <p className="text-sm text-muted-foreground mt-1">
              다른 분야나 키워드로 찾아볼까요?
            </p>
          </div>
        )}

        {filtered.map((mentor, i) => (
          <motion.article
            key={mentor.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className="rounded-3xl bg-card border border-card-border p-5 hover-elevate"
          >
            <div className="flex gap-4">
              <div
                className={`size-16 rounded-2xl ${mentor.avatarColor} flex items-center justify-center text-2xl font-extrabold shrink-0`}
                style={{ color: "hsl(30 50% 25%)" }}
              >
                {mentor.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold tracking-tight">{mentor.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Star size={13} fill="hsl(45 92% 55%)" stroke="hsl(45 92% 55%)" />
                    {mentor.rating}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {mentor.company} · {mentor.position}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} />
                    {mentor.university} {mentor.major}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} />
                    {mentor.yearsOfExperience}년차
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3.5 text-sm leading-relaxed text-foreground/85">
              "{mentor.bio}"
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {mentor.expertise.map((e) => (
                <Badge
                  key={e}
                  variant="outline"
                  className="rounded-full font-normal text-[11px] bg-secondary/10 border-secondary/25"
                  style={{ color: "hsl(88 45% 32%)" }}
                >
                  #{e}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground">
                누적 멘토링 {mentor.sessionsCount}회
              </span>
              <Link href={`/mentors/${mentor.id}/apply`}>
                <Button size="sm" className="rounded-full px-5 h-9 font-semibold">
                  멘토링 신청
                </Button>
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
