import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, PlayCircle, Video } from "lucide-react";
import { useListCareerVideos } from "@workspace/api-client-react";
import type { CareerVideo } from "@workspace/api-client-react";

const VIDEO_CATEGORIES = ["전체", "취업", "진로", "공부", "직장생활", "기타"];

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
    return null;
  } catch {
    return null;
  }
}

function getYoutubeThumbnail(url: string): string {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

function VideoModal({ video, onClose }: { video: CareerVideo; onClose: () => void }) {
  const id = getYoutubeId(video.youtubeUrl);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
            {id ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-muted text-muted-foreground text-sm">
                영상을 불러올 수 없습니다.
              </div>
            )}
          </div>

          <div className="mt-3 px-1">
            <div className="flex items-center gap-2 mb-1">
              {(video as CareerVideo & { category?: string }).category && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                  {(video as CareerVideo & { category?: string }).category}
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-lg leading-snug">{video.title}</h3>
            {video.description && (
              <p className="mt-1 text-white/70 text-sm leading-relaxed">{video.description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoCard({ video, onClick }: { video: CareerVideo; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const thumb = getYoutubeThumbnail(video.youtubeUrl);
  const category = (video as CareerVideo & { category?: string }).category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumb && !imgError ? (
          <img
            src={thumb}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <Video size={32} className="text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="size-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play size={22} className="text-foreground fill-foreground ml-1" />
          </div>
        </div>
        {category && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function CareerMatching() {
  const { data: videos = [], isLoading } = useListCareerVideos();
  const [selected, setSelected] = useState<CareerVideo | null>(null);
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered = activeCategory === "전체"
    ? videos
    : videos.filter((v) => (v as CareerVideo & { category?: string }).category === activeCategory);

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/15 text-foreground">
            <PlayCircle size={12} />고민 맞춤 영상
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          현재 고민이 있으시다면<br className="hidden sm:block" />
          <span className="text-primary"> 내 고민에 맞는 영상</span>을 찾아 시청해 보세요.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl">
          취업·진로·인문학에 관한 다양한 TIP을 위미가 직접 제작한 영상으로 만나보세요. 영상을 클릭하면 바로 재생됩니다.
        </p>
      </motion.div>

      {/* 카테고리 필터 */}
      <div className="mt-8 flex gap-2 flex-wrap">
        {VIDEO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeCategory === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {cat}
            {cat !== "전체" && videos.filter((v) => (v as CareerVideo & { category?: string }).category === cat).length > 0 && (
              <span className="ml-1 opacity-60">
                {videos.filter((v) => (v as CareerVideo & { category?: string }).category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted/50 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <PlayCircle size={28} className="text-primary/60" />
            </div>
            <p className="text-base font-semibold text-foreground/70">
              {activeCategory === "전체" ? "곧 영상이 업로드됩니다" : `'${activeCategory}' 카테고리 영상이 없어요`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">위미가 준비한 맞춤 영상을 기대해 주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} onClick={() => setSelected(video)} />
            ))}
          </div>
        )}
      </div>

      {selected && <VideoModal video={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
