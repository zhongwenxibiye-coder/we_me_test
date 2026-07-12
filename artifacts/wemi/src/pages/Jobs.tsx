import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useListJobListings, useListJobCategories, type JobListing } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";
import { useJobLikes } from "@/hooks/useJobLikes";
import { useAuth } from "@/contexts/AuthContext";

export default function Jobs() {
  const [active, setActive] = useState<string>("");
  const { data: allJobs = [], isLoading } = useListJobListings<JobListing[]>();
  const { data: allCategories = [] } = useListJobCategories();
  const { likes, userLikes, toggleLike } = useJobLikes();
  const { user } = useAuth();

  // 활성 카테고리만 표시 순서대로
  const categories = allCategories
    .filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 활성 카테고리가 로드됐을 때 기본 선택값 설정
  useEffect(() => {
    if (categories.length > 0 && (!active || !categories.find((c) => c.name === active))) {
      setActive(categories[0].name);
    }
  }, [categories, active]);

  const subJobs = allJobs
    .filter((j) => j.isActive && j.category === active)
    .sort((a, b) => a.displayOrder - b.displayOrder);

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
          <p className="mt-3 text-muted-foreground max-w-2xl">인문계열이 선택 가능한 직무를 모아왔어요. 궁금한 직무를 살펴보세요. 직무는 계속 추가됩니다.</p>
        </div>
        <Mascot size={84} animate="bob" className="hidden sm:block" />
      </motion.div>
      {/* Category buttons */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.name)}
            className={cn(
              "px-5 h-11 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border",
              active === c.name
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover-elevate",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
      {/* Sub-job box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-6 rounded-3xl bg-card border border-card-border p-6 lg:p-8"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight">{active}</h2>
            <span className="text-sm text-muted-foreground">총 {subJobs.length}개의 세부 직무</span>
          </div>

          {isLoading ? (
            <div className="mt-6 py-10 text-center text-muted-foreground">불러오는 중...</div>
          ) : subJobs.length === 0 ? (
            <div className="mt-6 py-12 rounded-2xl bg-muted/40 text-center">
              <Mascot size={72} animate="bob" />
              <p className="mt-3 font-semibold">아직 준비 중인 직무예요</p>
              <p className="text-sm text-muted-foreground mt-1">곧 위미가 알찬 콘텐츠로 채워드릴게요.</p>
            </div>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-border bg-background p-4 hover-elevate flex flex-col"
                >
                  {job.imageUrl && (
                    <div className="rounded-xl bg-muted/40 mb-3 overflow-hidden flex items-center justify-center aspect-[4/3]">
                      <img
                        src={job.imageUrl?.startsWith("data:") ? job.imageUrl : `${import.meta.env.BASE_URL}${job.imageUrl}`}
                        alt={job.title}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <h3 className="font-extrabold text-base tracking-tight">"{job.title}"</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3 flex-1">
                    {job.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button className="w-full rounded-xl h-9 text-sm font-semibold">
                        자세히 보기
                        <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { if (!user) return; void toggleLike(job.id); }}
                      title={user ? (userLikes.has(String(job.id)) ? "관심 해제" : "관심 직무 추가") : "로그인 후 이용 가능"}
                      className={cn(
                        "flex items-center gap-1 h-9 px-3 rounded-xl border text-xs font-semibold transition-colors shrink-0",
                        userLikes.has(String(job.id))
                          ? "border-red-300 bg-red-50 text-red-500"
                          : "border-border text-muted-foreground hover:border-red-300 hover:text-red-400",
                        !user && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      <Heart size={13} className={userLikes.has(String(job.id)) ? "fill-red-500" : ""} />
                      <span>{likes[String(job.id)] ?? 0}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
