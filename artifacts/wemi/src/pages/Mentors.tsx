import { Fragment, useMemo, useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, GraduationCap, Briefcase, ChevronRight, ChevronDown, ChevronUp, Heart, X, Loader2,
} from "lucide-react";
import {
  useListMentors, useGetMentor,
  type MentorProfile, type MentorDetail, type MentorArticle,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

// ── 멘토 인라인 상세 패널 ─────────────────────────────────────

function MentorInlineDetail({ mentorId, onClose }: { mentorId: number; onClose: () => void }) {
  const { data: mentor, isLoading } = useGetMentor<MentorDetail>(mentorId);
  const [showDonation, setShowDonation] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isLoading, mentorId]);

  return (
    <motion.div
      ref={panelRef}
      key={mentorId}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      className="col-span-full rounded-3xl bg-card border-2 border-primary/30 overflow-hidden"
    >
      {isLoading || !mentor ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* 헤더: 프로필 */}
          <div className="px-6 lg:px-8 py-6 border-b border-border/60 flex items-start gap-5">
            {/* 사진 / 이니셜 */}
            {mentor.photoUrl ? (
              <img
                src={mentor.photoUrl}
                alt={mentor.name}
                className="size-20 rounded-full object-cover shrink-0 border-4 border-primary/20"
              />
            ) : (
              <div
                className={cn(
                  "size-20 rounded-full flex items-center justify-center text-3xl font-extrabold shrink-0 border-4 border-primary/20",
                  mentor.avatarColor,
                )}
                style={{ color: "hsl(30 50% 25%)" }}
              >
                {mentor.initial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">{mentor.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><GraduationCap size={13} />{mentor.major}</span>
                    <span className="flex items-center gap-1"><Briefcase size={13} />경력 {mentor.yearsOfExperience}년</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground shrink-0"
                  title="닫기"
                >
                  <X size={16} />
                </button>
              </div>

              {mentor.headlineText && (
                <p className="mt-3 text-base font-extrabold leading-relaxed">{mentor.headlineText}</p>
              )}
              {mentor.sublineText && (
                <p className="mt-1 text-sm font-semibold text-foreground/75 leading-relaxed">{mentor.sublineText}</p>
              )}
            </div>
          </div>

          {/* 인사말 / 소개 */}
          {mentor.bio && (
            <div className="px-6 lg:px-8 py-5 border-b border-border/60 bg-muted/20">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">멘토 인사말</p>
              <p className="text-sm text-foreground/85 leading-loose whitespace-pre-wrap">{mentor.bio}</p>
            </div>
          )}

          {/* 아티클 목록 + 신청 버튼 */}
          <div className="divide-y divide-border/50">
            {mentor.articles
              .filter((a: MentorArticle) => a.isActive)
              .sort((a: MentorArticle, b: MentorArticle) => a.displayOrder - b.displayOrder)
              .map((article: MentorArticle) => (
                <Link key={article.id} href={`/mentors/${mentor.id}/articles/${article.id}`}>
                  <button className="w-full flex items-center justify-between px-6 lg:px-8 py-4 text-left hover:bg-primary/5 transition-colors">
                    <span className="text-sm font-semibold">{article.title}</span>
                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </button>
                </Link>
              ))}

            {/* 1:1 멘토링 신청 */}
            <Link href={`/mentors/${mentor.id}/apply`}>
              <button
                className="w-full flex items-center justify-between px-6 lg:px-8 py-4 text-left hover:bg-primary/5 transition-colors font-extrabold text-sm"
                style={{ color: "hsl(35 60% 28%)" }}
              >
                1:1 멘토링 신청하기
                <ChevronRight size={15} className="shrink-0" style={{ color: "hsl(35 60% 28%)" }} />
              </button>
            </Link>

            {/* 후원 */}
            <div>
              <button
                onClick={() => setShowDonation((v) => !v)}
                className="w-full flex items-center justify-between px-6 lg:px-8 py-4 text-left hover:bg-primary/5 transition-colors text-sm"
              >
                <span className="font-semibold flex items-center gap-2">
                  <Heart size={14} className="text-rose-400" />멘토 후원하기
                </span>
                {showDonation
                  ? <ChevronUp size={15} className="text-muted-foreground" />
                  : <ChevronDown size={15} className="text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {showDonation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 lg:px-8 pb-4 pt-1 text-sm text-muted-foreground bg-muted/30 border-t border-border/40">
                      현재는 후원을 받지 않고 있습니다.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── 멘토 카드 ─────────────────────────────────────────────────

function MentorCard({
  mentor,
  isSelected,
  onSelect,
}: {
  mentor: MentorProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl bg-card border p-6 flex flex-col transition-all duration-200",
        isSelected
          ? "border-primary/50 shadow-md ring-2 ring-primary/20"
          : "border-card-border hover-elevate",
      )}
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

      <Button
        onClick={onSelect}
        className={cn("mt-5 w-full rounded-xl h-10 font-semibold gap-1.5", isSelected && "bg-muted text-foreground border border-border hover:bg-muted/80")}
        variant={isSelected ? "outline" : "default"}
      >
        {isSelected ? (
          <>
            <ChevronUp size={14} />접기
          </>
        ) : (
          <>
            자세히 보기<ChevronDown size={14} />
          </>
        )}
      </Button>
    </motion.article>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────

export default function Mentors() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: mentors = [], isLoading } = useListMentors();

  const filtered = useMemo(() => {
    if (!query) return mentors;
    const q = query.toLowerCase();
    return (mentors as MentorProfile[]).filter((m) => {
      const blob = `${m.name} ${m.major}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query, mentors]);

  const handleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

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
          {(filtered as MentorProfile[]).map((mentor) => (
            <Fragment key={mentor.id}>
              <MentorCard
                mentor={mentor}
                isSelected={selectedId === mentor.id}
                onSelect={() => handleSelect(mentor.id)}
              />
              {/* 해당 멘토가 선택됐을 때 — 카드 다음 열에 풀 너비 패널 삽입 */}
              <AnimatePresence mode="wait">
                {selectedId === mentor.id && (
                  <MentorInlineDetail
                    key={`detail-${mentor.id}`}
                    mentorId={mentor.id}
                    onClose={() => setSelectedId(null)}
                  />
                )}
              </AnimatePresence>
            </Fragment>
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
