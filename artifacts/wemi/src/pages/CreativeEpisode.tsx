import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useListCreativeWorks,
  useListCreativeEpisodes,
} from "@workspace/api-client-react";
import { RichContent } from "@/components/RichContent";

export default function CreativeEpisode() {
  const [, params] = useRoute("/creative-space/:workId/episodes/:episodeId");
  const [, navigate] = useLocation();

  const workId = Number(params?.workId);
  const episodeId = Number(params?.episodeId);

  const worksQuery = useListCreativeWorks();
  const episodesQuery = useListCreativeEpisodes(workId);

  const work = worksQuery.data?.find((w) => w.id === workId);
  const episodes = (episodesQuery.data ?? []).filter((e) => e.isActive);
  const episode = episodes.find((e) => e.id === episodeId);
  const currentIndex = episodes.findIndex((e) => e.id === episodeId);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  const isLoading = worksQuery.isLoading || episodesQuery.isLoading;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [episodeId]);

  return (
    <div className="mx-auto max-w-2xl px-6 lg:px-10 py-12">
      <button
        onClick={() => navigate("/creative-space")}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3 mb-8"
      >
        <ArrowLeft size={14} />
        창작 공간으로
      </button>

      {isLoading ? (
        <div className="text-center py-24 text-muted-foreground">불러오는 중...</div>
      ) : !work || !episode ? (
        <div className="text-center py-24 text-muted-foreground">콘텐츠를 찾을 수 없습니다.</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <p className="text-xs font-semibold" style={{ color: "hsl(45 92% 38%)" }}>
              [{work.category}] {work.title}
              {work.authorName ? ` · ${work.authorName}` : ""}
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-extrabold tracking-tight">
              {episode.episodeNumber}화: {episode.title}
            </h1>
          </div>

          {/* 제목 아래 이전/다음화 */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              className="rounded-full bg-card"
              disabled={!prevEpisode}
              onClick={() =>
                prevEpisode &&
                navigate(`/creative-space/${workId}/episodes/${prevEpisode.id}`)
              }
            >
              <ChevronLeft size={16} className="mr-1" />
              이전화
            </Button>
            <span className="text-sm text-muted-foreground">
              {episode.episodeNumber} / {episodes.length}화
            </span>
            <Button
              variant="outline"
              className="rounded-full bg-card"
              disabled={!nextEpisode}
              onClick={() =>
                nextEpisode &&
                navigate(`/creative-space/${workId}/episodes/${nextEpisode.id}`)
              }
            >
              다음화
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="bg-card rounded-2xl border border-border px-6 py-8 lg:px-10 lg:py-10 space-y-6">
            {episode.content && (
              <RichContent content={episode.content} className="text-base" />
            )}

            {Array.isArray(episode.images) && episode.images.length > 0 && (
              <div className="space-y-4 pt-2">
                {(episode.images as string[]).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`이미지 ${i + 1}`}
                    className="w-full rounded-xl border border-border object-contain max-h-[600px]"
                  />
                ))}
              </div>
            )}

            {!episode.content && (!Array.isArray(episode.images) || episode.images.length === 0) && (
              <span className="text-muted-foreground italic">내용이 아직 없습니다.</span>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              className="rounded-full bg-card"
              disabled={!prevEpisode}
              onClick={() =>
                prevEpisode &&
                navigate(`/creative-space/${workId}/episodes/${prevEpisode.id}`)
              }
            >
              <ChevronLeft size={16} className="mr-1" />
              이전화
            </Button>
            <span className="text-sm text-muted-foreground">
              {episode.episodeNumber} / {episodes.length}화
            </span>
            <Button
              variant="outline"
              className="rounded-full bg-card"
              disabled={!nextEpisode}
              onClick={() =>
                nextEpisode &&
                navigate(`/creative-space/${workId}/episodes/${nextEpisode.id}`)
              }
            >
              다음화
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
