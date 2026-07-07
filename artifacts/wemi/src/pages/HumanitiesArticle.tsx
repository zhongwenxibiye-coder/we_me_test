import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, User, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetHumanitiesArticle } from "@workspace/api-client-react";
import { RichContent } from "@/components/RichContent";

function CardNewsViewer({ pages }: { pages: string[] }) {
  const [current, setCurrent] = useState(0);

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 rounded-2xl border border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">카드 페이지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="select-none">
      <div className="relative rounded-2xl overflow-hidden border border-border bg-background" style={{ aspectRatio: "3/4", maxHeight: 600 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={current}
            src={pages[current]}
            alt={`카드 ${current + 1}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
          />
        </AnimatePresence>

        {/* 이전/다음 화살표 */}
        {current > 0 && (
          <button
            onClick={() => setCurrent((c) => c - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {current < pages.length - 1 && (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* 페이지 인디케이터 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === current ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* 썸네일 스크롤 */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {pages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${idx === current ? "border-primary" : "border-transparent"}`}
            style={{ width: 52, height: 70 }}
          >
            <img src={page} alt={`${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">{current + 1} / {pages.length}</p>
    </div>
  );
}

export default function HumanitiesArticle() {
  const [, params] = useRoute("/humanities/articles/:id");
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const query = useGetHumanitiesArticle(id);
  const article = query.data;

  const isCard = article?.contentType === "card";
  const cardPages = Array.isArray(article?.cardPages) ? (article.cardPages as string[]) : [];

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12">
      <button
        onClick={() => navigate("/humanities")}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3 mb-8"
      >
        <ArrowLeft size={14} />
        인문학 콘텐츠로
      </button>

      {query.isLoading ? (
        <div className="text-center py-24 text-muted-foreground">불러오는 중...</div>
      ) : !article ? (
        <div className="text-center py-24 text-muted-foreground">콘텐츠를 찾을 수 없습니다.</div>
      ) : (
        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {!isCard && (
            article.imageUrl ? (
              <div className="mb-8 rounded-2xl overflow-hidden border border-border">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full max-h-[380px] object-cover"
                />
              </div>
            ) : (
              <div className="mb-8 rounded-2xl border border-border bg-muted/30 flex items-center justify-center h-40">
                <BookOpen size={48} className="text-muted-foreground/25" />
              </div>
            )
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "hsl(45 92% 90%)", color: "hsl(45 92% 30%)" }}
              >
                {article.category}
              </span>
              {isCard && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-foreground">
                  🃏 카드뉴스
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug">
              {article.title}
            </h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {article.authorName || "위미"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(article.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {isCard ? (
            <CardNewsViewer pages={cardPages} />
          ) : (
            <div className="bg-card rounded-2xl border border-border px-6 py-8 lg:px-10 lg:py-10">
              {article.content
                ? <RichContent content={article.content} className="text-base" />
                : <p className="italic text-muted-foreground text-sm">내용이 준비 중입니다.</p>}
            </div>
          )}
        </motion.article>
      )}
    </div>
  );
}
