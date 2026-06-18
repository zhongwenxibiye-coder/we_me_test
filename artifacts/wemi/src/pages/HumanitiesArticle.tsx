import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import { useGetHumanitiesArticle } from "@workspace/api-client-react";
import { RichContent } from "@/components/RichContent";

export default function HumanitiesArticle() {
  const [, params] = useRoute("/humanities/articles/:id");
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const query = useGetHumanitiesArticle(id);
  const article = query.data;

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
          {article.imageUrl ? (
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
          )}

          <div className="mb-6">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "hsl(45 92% 90%)", color: "hsl(45 92% 30%)" }}
            >
              {article.category}
            </span>
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

          <div className="bg-card rounded-2xl border border-border px-6 py-8 lg:px-10 lg:py-10">
            {article.content
              ? <RichContent content={article.content} className="text-base" />
              : <p className="italic text-muted-foreground text-sm">내용이 준비 중입니다.</p>}
          </div>
        </motion.article>
      )}
    </div>
  );
}
