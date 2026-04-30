import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import {
  JOB_CATEGORIES,
  getSubJobsByCategory,
  type JobCategory,
} from "@/data/jobs";
import { cn } from "@/lib/utils";

export default function Jobs() {
  const [active, setActive] = useState<JobCategory>("영업");
  const subJobs = getSubJobsByCategory(active);

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
          <p className="mt-3 text-muted-foreground max-w-2xl">
            인문계열이 선택 가능한 직무를 모아왔어요. 마음에 드는 직무를 골라 깊이 들여다보세요.
          </p>
        </div>
        <Mascot size={84} animate="bob" className="hidden sm:block" />
      </motion.div>

      {/* Category buttons */}
      <div className="mt-8 flex flex-wrap gap-2">
        {JOB_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "px-5 h-11 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border",
              active === c
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover-elevate",
            )}
          >
            {c}
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
            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight">
              {active}
            </h2>
            <span className="text-sm text-muted-foreground">
              총 {subJobs.length}개의 세부 직무
            </span>
          </div>

          {subJobs.length === 0 ? (
            <div className="mt-6 py-12 rounded-2xl bg-muted/40 text-center">
              <Mascot size={72} animate="bob" />
              <p className="mt-3 font-semibold">아직 준비 중인 직무예요</p>
              <p className="text-sm text-muted-foreground mt-1">
                곧 위미가 알찬 콘텐츠로 채워드릴게요.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-border bg-background p-4 hover-elevate flex flex-col"
                >
                  {job.image && (
                    <div className="rounded-xl bg-muted/40 mb-3 overflow-hidden flex items-center justify-center aspect-[4/3]">
                      <img
                        src={`${import.meta.env.BASE_URL}${job.image}`}
                        alt={job.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  {job.topRecommended && (
                    <span
                      className="inline-flex items-center gap-1 self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 mb-1.5"
                      style={{ color: "hsl(35 60% 25%)" }}
                    >
                      <Sparkles size={10} />
                      가장 가능성이 높은 직무
                    </span>
                  )}
                  <h3 className="font-extrabold text-base tracking-tight">
                    "{job.title}"
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3 flex-1">
                    {job.shortDescription}
                  </p>
                  <Link href={`/jobs/${job.id}`}>
                    <Button className="mt-3 w-full rounded-xl h-9 text-sm font-semibold">
                      자세히 보기
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
