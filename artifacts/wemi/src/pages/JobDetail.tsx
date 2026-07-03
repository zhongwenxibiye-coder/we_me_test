import { useState, useRef, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, BookOpen } from "lucide-react";
import { useListJobListings, type JobListing } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";
import { RichContent } from "@/components/RichContent";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = params?.id ? parseInt(params.id, 10) : NaN;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (openIdx === null) return;
    const el = itemRefs.current[openIdx];
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [openIdx]);

  const { data: allJobs = [], isLoading } = useListJobListings<JobListing[]>();
  const job = isNaN(id) ? undefined : allJobs.find((j) => j.id === id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16 text-center">
        <Mascot size={120} animate="bob" />
        <p className="mt-4 font-semibold text-lg">직무를 찾을 수 없어요</p>
        <Link href="/jobs">
          <Button className="mt-5 rounded-full">직무 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href="/jobs">
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          직무 목록
        </button>
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mt-4 rounded-3xl bg-card border border-card-border p-6 lg:p-8",
          job.imageUrl && "grid md:grid-cols-[200px_1fr] gap-6 items-center",
        )}
      >
        {job.imageUrl && (
          <div className="rounded-2xl bg-muted/40 overflow-hidden flex items-center justify-center aspect-square">
            <img
              src={job.imageUrl?.startsWith("data:") ? job.imageUrl : `${import.meta.env.BASE_URL}${job.imageUrl}`}
              alt={job.title}
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
            />
          </div>
        )}
        <div>
          <span
            className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30"
            style={{ color: "hsl(88 45% 32%)" }}
          >
            {job.category}
          </span>
          <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold tracking-tight">"{job.title}"</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{job.shortDescription}</p>
        </div>
      </motion.div>

      {/* Learning list */}
      {job.learning && job.learning.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight">학습 목록</h2>
          <p className="text-sm text-muted-foreground mt-1">관심 있는 항목을 눌러서 내용을 펼쳐보세요.</p>

          <div className="mt-5 rounded-3xl bg-card border border-card-border overflow-hidden divide-y divide-border/60">
            {job.learning.map((item, idx) => {
              const open = openIdx === idx;
              const empty = !item.content;
              return (
                <div key={idx} ref={(el) => { itemRefs.current[idx] = el; }}>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center gap-3 px-5 py-5 text-left hover-elevate"
                  >
                    <span
                      className="size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: "hsl(45 80% 88%)", color: "hsl(35 60% 25%)" }}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-semibold text-base">{item.title}</span>
                    <ChevronDown
                      size={18}
                      className={cn("transition-transform text-muted-foreground", open && "rotate-180")}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1 pl-16">
                      {empty ? (
                        <div className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/30 px-5 py-4">
                          <p className="text-xs text-muted-foreground/50 italic flex items-center gap-1.5">
                            <BookOpen size={12} />내용 추가 예정
                          </p>
                        </div>
                      ) : (
                        <RichContent content={item.content ?? ""} />
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
