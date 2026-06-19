import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useListHumanitiesArticles, type HumanitiesArticle } from "@workspace/api-client-react";

const CATEGORIES = ["전체", "문학", "문화", "역사", "지리", "예술", "기타"];

function ArticleRow({ article }: { article: HumanitiesArticle }) {
  const [, navigate] = useLocation();
  return (
    <button
      onClick={() => navigate(`/humanities/articles/${article.id}`)}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-primary/8 transition-colors text-left border-b border-border/40 last:border-0"
    >
      <div className="shrink-0 size-10 sm:size-12 rounded-full overflow-hidden border-2 border-border bg-muted/40">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={18} className="text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2 sm:gap-3">
        <span
          className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "hsl(45 92% 90%)", color: "hsl(45 92% 30%)" }}
        >
          {article.category}
        </span>
        <span className="font-semibold text-sm flex-1 truncate min-w-0">{article.title}</span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{article.authorName}</span>
        <span className="text-xs text-muted-foreground/60 shrink-0">
          {new Date(article.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>
    </button>
  );
}

function ArticlesSection() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const query = useListHumanitiesArticles();
  const all = query.data ?? [];
  const articles = activeCategory === "전체" ? all : all.filter((a) => a.category === activeCategory);

  return (
    <section>
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeCategory === c ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:border-foreground/40"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <p className="text-center text-muted-foreground py-16">불러오는 중...</p>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookOpen size={40} className="text-muted-foreground/25 mb-3" />
          <p className="font-semibold text-muted-foreground">아직 콘텐츠가 없어요.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {articles.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HumanitiesContent() {
  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          HUMANITIES
        </p>
        <h1 className="mt-1 text-3xl lg:text-4xl font-extrabold tracking-tight">인문학 콘텐츠</h1>
        <p className="mt-2 text-muted-foreground">다양한 인문학 콘텐츠를 만나보세요.</p>
      </motion.div>
      <ArticlesSection />
    </div>
  );
}
