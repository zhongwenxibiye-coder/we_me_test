import { useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, GraduationCap, Briefcase, Heart } from "lucide-react";
import { useGetMentor } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

export default function MentorDetail() {
  const [, params] = useRoute("/mentors/:id");
  const id = params?.id ? parseInt(params.id, 10) : NaN;
  const [showDonation, setShowDonation] = useState(false);

  const { data: mentor, isLoading, isError } = useGetMentor(isNaN(id) ? 0 : id);

  if (isNaN(id) || isError) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16 text-center">
        <Mascot size={120} animate="bob" />
        <p className="mt-4 font-semibold text-lg">멘토를 찾을 수 없어요</p>
        <Link href="/mentors">
          <Button className="mt-5 rounded-full">멘토 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (!mentor) return null;

  const activeArticles = mentor.articles.filter((a) => a.isActive);

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href="/mentors">
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          멘토 목록
        </button>
      </Link>

      {/* Profile */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-3xl bg-card border border-card-border p-6 lg:p-8"
      >
        {/* Photo */}
        <div className="flex flex-col items-center text-center">
          {mentor.photoUrl ? (
            <img
              src={mentor.photoUrl}
              alt={mentor.name}
              className="size-28 rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div
              className={cn(
                "size-28 rounded-full flex items-center justify-center text-5xl font-extrabold border-4 border-primary/20",
                mentor.avatarColor,
              )}
              style={{ color: "hsl(30 50% 25%)" }}
            >
              {mentor.initial}
            </div>
          )}

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{mentor.name}</h1>
          <div className="flex items-center gap-x-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><GraduationCap size={14} />{mentor.major}</span>
            <span className="flex items-center gap-1"><Briefcase size={14} />경력 {mentor.yearsOfExperience}년</span>
          </div>

          {mentor.headlineText && (
            <p className="mt-5 text-base font-extrabold leading-relaxed max-w-2xl">{mentor.headlineText}</p>
          )}
          {mentor.sublineText && (
            <p className="mt-2 text-base font-semibold text-foreground/75 leading-relaxed max-w-2xl">{mentor.sublineText}</p>
          )}
          {mentor.bio && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-wrap">{mentor.bio}</p>
          )}
        </div>
      </motion.section>

      {/* 멘토링 목록 */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-6 rounded-3xl bg-card border border-card-border overflow-hidden"
      >
        {activeArticles.map((article, i) => (
          <Link key={article.id} href={`/mentors/${id}/articles/${article.id}`}>
            <button
              className={cn(
                "w-full flex items-center justify-between px-6 lg:px-8 py-5 text-left hover:bg-primary/5 transition-colors",
                i < activeArticles.length - 1 && "border-b border-border/60",
              )}
            >
              <span className="font-semibold text-base">{article.title}</span>
              <ChevronRight size={18} className="text-muted-foreground shrink-0" />
            </button>
          </Link>
        ))}

        {/* 1:1 멘토링 신청 */}
        <Link href={`/mentors/${id}/apply`}>
          <button
            className={cn(
              "w-full flex items-center justify-between px-6 lg:px-8 py-5 text-left hover:bg-primary/5 transition-colors font-extrabold text-base",
              activeArticles.length > 0 && "border-t border-border/60",
            )}
            style={{ color: "hsl(35 60% 28%)" }}
          >
            1:1 멘토링 신청
            <ChevronRight size={18} className="shrink-0" style={{ color: "hsl(35 60% 28%)" }} />
          </button>
        </Link>

        {/* 멘토 후원하기 */}
        <button
          onClick={() => setShowDonation((v) => !v)}
          className="w-full flex items-center justify-between px-6 lg:px-8 py-5 text-left hover:bg-primary/5 transition-colors border-t border-border/60"
        >
          <span className="font-semibold text-base flex items-center gap-2">
            <Heart size={16} className="text-rose-400" /> 멘토 후원하기
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>
        {showDonation && (
          <div className="px-6 lg:px-8 pb-5 pt-1 text-sm text-muted-foreground bg-muted/30 border-t border-border/40">
            현재는 후원을 받지 않고 있습니다.
          </div>
        )}
      </motion.section>
    </div>
  );
}
