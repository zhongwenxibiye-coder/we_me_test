import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { useListMentors, type MentorProfile } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

export default function Mentors() {
  const [query, setQuery] = useState("");
  const { data: mentors = [], isLoading } = useListMentors();

  const filtered = useMemo(() => {
    if (!query) return mentors;
    const q = query.toLowerCase();
    return mentors.filter((m: MentorProfile) => {
      const blob = `${m.name} ${m.major}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query, mentors]);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
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

      <div className="mt-8 flex gap-4 items-center">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름·전공으로 찾기"
            className="h-12 pl-11 rounded-2xl bg-card"
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        총 <span className="font-bold text-foreground">{filtered.length}명</span>의 멘토
      </p>

      {isLoading ? (
        <div className="mt-10 text-center text-muted-foreground py-16">불러오는 중...</div>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mentor: MentorProfile, i: number) => (
            <motion.article
              key={mentor.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-3xl bg-card border border-card-border p-6 hover-elevate flex flex-col"
            >
              <div className="flex items-start gap-4">
                {mentor.photoUrl ? (
                  <img
                    src={mentor.photoUrl}
                    alt={mentor.name}
                    className="size-16 rounded-full object-cover shrink-0 border-2 border-primary/20"
                  />
                ) : (
                  <div
                    className={cn("size-16 rounded-full flex items-center justify-center text-2xl font-extrabold shrink-0", mentor.avatarColor)}
                    style={{ color: "hsl(30 50% 25%)" }}
                  >
                    {mentor.initial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold tracking-tight truncate">{mentor.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><GraduationCap size={11} />{mentor.major}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} />{mentor.yearsOfExperience}년차</span>
                  </div>
                </div>
              </div>

              {mentor.headlineText && (
                <p className="mt-4 text-sm leading-relaxed text-foreground/85 flex-1 font-semibold">
                  {mentor.headlineText}
                </p>
              )}

              <Link href={`/mentors/${mentor.id}`}>
                <Button className="mt-5 w-full rounded-xl h-10 font-semibold">
                  자세히 보기
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </motion.article>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 rounded-3xl bg-card border border-card-border mt-4">
          <Mascot size={96} animate="bob" />
          <p className="mt-4 font-semibold text-lg">조건에 맞는 멘토가 아직 없어요</p>
          <p className="text-sm text-muted-foreground mt-1">다른 키워드로 찾아볼까요?</p>
        </div>
      )}
    </div>
  );
}
