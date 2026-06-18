import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useGetMentor } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { RichContent } from "@/components/RichContent";

export default function ArticleDetail() {
  const [, params] = useRoute("/mentors/:mentorId/articles/:articleId");
  const mentorId = params?.mentorId ? parseInt(params.mentorId, 10) : NaN;
  const articleId = params?.articleId ? parseInt(params.articleId, 10) : NaN;

  const { data: mentor, isLoading, isError } = useGetMentor(isNaN(mentorId) ? 0 : mentorId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  const article = mentor?.articles.find((a) => a.id === articleId);

  if (isError || !mentor || !article) {
    return (
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 text-center">
        <Mascot size={120} animate="bob" />
        <p className="mt-4 font-semibold text-lg">내용을 찾을 수 없어요</p>
        <Link href={`/mentors/${mentorId}`}>
          <Button className="mt-5 rounded-full">멘토 페이지로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href={`/mentors/${mentorId}`}>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          {mentor.name} 멘토
        </button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{article.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mentor.name} 멘토</p>

        <div className="mt-8 rounded-3xl bg-card border border-card-border p-6 lg:p-8 min-h-48">
          {article.content ? (
            <RichContent content={article.content} />
          ) : (
            <div className="text-center py-10">
              <Mascot size={80} animate="bob" />
              <p className="mt-4 text-sm text-muted-foreground">곧 내용이 업데이트될 예정이에요.</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href={`/mentors/${mentorId}/apply`}>
            <Button className="rounded-full px-8 h-12 font-bold">
              1:1 멘토링 신청하기
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
