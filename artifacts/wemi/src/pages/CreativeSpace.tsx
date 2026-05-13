import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, ImageIcon } from "lucide-react";
import {
  useListCreativeWorks,
  useListCreativeEpisodes,
  type CreativeWork,
} from "@workspace/api-client-react";

function EpisodeList({ workId }: { workId: number }) {
  const [, navigate] = useLocation();
  const episodesQuery = useListCreativeEpisodes(workId);
  const episodes = episodesQuery.data ?? [];

  if (episodesQuery.isLoading) {
    return <p className="text-xs text-muted-foreground text-center py-4">불러오는 중...</p>;
  }
  if (episodes.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-4">에피소드가 없어요.</p>;
  }
  return (
    <ul>
      {episodes.map((ep) => (
        <li key={ep.id}>
          <button
            className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition-colors flex items-center gap-2 border-b border-border/40 last:border-0"
            onClick={() => navigate(`/creative-space/${workId}/episodes/${ep.id}`)}
          >
            <span className="shrink-0 text-xs font-bold w-10" style={{ color: "hsl(45 92% 38%)" }}>
              {ep.episodeNumber}화
            </span>
            <span className="text-sm font-medium truncate">{ep.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function WorkCard({ work }: { work: CreativeWork }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col"
    >
      <button className="w-full text-left" onClick={() => setExpanded(!expanded)}>
        <div className="aspect-[3/4] bg-muted/30 relative overflow-hidden">
          {work.thumbnailUrl ? (
            <img
              src={work.thumbnailUrl}
              alt={work.title}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={40} className="text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="px-3 py-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-semibold" style={{ color: "hsl(45 92% 38%)" }}>
              [{work.category}]
            </span>
            <p className="text-sm font-bold mt-0.5 line-clamp-2 leading-snug">{work.title}</p>
          </div>
          <span className="shrink-0 mt-1 text-muted-foreground">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border"
          >
            <EpisodeList workId={work.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CreativeSpace() {
  const query = useListCreativeWorks();
  const works = (query.data ?? []).filter((w) => w.isActive);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          CREATIVE SPACE
        </p>
        <h1 className="mt-1 text-3xl lg:text-4xl font-extrabold tracking-tight">창작 공간</h1>
        <p className="mt-2 text-muted-foreground">전공 지식으로 만든 다양한 창작물을 감상해 보세요!</p>
      </motion.div>
      {query.isLoading ? (
        <div className="text-center py-24 text-muted-foreground">불러오는 중...</div>
      ) : works.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <BookOpen size={48} className="text-muted-foreground/25 mb-4" />
          <p className="font-semibold text-muted-foreground">아직 창작물이 없습니다.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">곧 멋진 작품들이 올라올 거예요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
