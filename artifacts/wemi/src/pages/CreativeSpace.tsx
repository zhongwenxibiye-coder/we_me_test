import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, ImageIcon, Send, CheckCircle2 } from "lucide-react";
import {
  useListCreativeWorks,
  useListCreativeEpisodes,
  useCreateCreativeWorkSubmission,
  type CreativeWork,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function EpisodeList({ workId, totalCount }: { workId: number; totalCount: number }) {
  const [, navigate] = useLocation();
  const episodesQuery = useListCreativeEpisodes(workId);
  const episodes = (episodesQuery.data ?? []).filter((e) => e.isActive);

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
  const episodesQuery = useListCreativeEpisodes(work.id);
  const episodeCount = (episodesQuery.data ?? []).filter((e) => e.isActive).length;

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
          {!episodesQuery.isLoading && episodeCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-foreground/80 text-background text-xs font-bold px-2 py-0.5 rounded-full">
              총 {episodeCount}화
            </div>
          )}
        </div>
        <div className="px-3 py-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-semibold" style={{ color: "hsl(45 92% 38%)" }}>
              [{work.category}]
            </span>
            <p className="text-sm font-bold mt-0.5 line-clamp-2 leading-snug">{work.title}</p>
            {work.authorName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{work.authorName}</p>
            )}
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
            <EpisodeList workId={work.id} totalCount={episodeCount} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubmissionForm() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ authorName: "", email: "", description: "" });
  const submit = useCreateCreativeWorkSubmission();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.description.length < 200) return;
    submit.mutate(
      { data: form },
      {
        onSuccess: () => {
          setDone(true);
          setForm({ authorName: "", email: "", description: "" });
        },
      },
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 flex flex-col items-center text-center py-10 px-6 bg-card rounded-3xl border border-border"
      >
        <CheckCircle2 size={44} className="text-primary mb-4" />
        <p className="font-extrabold text-lg">신청이 되었습니다.</p>
        <p className="text-sm text-muted-foreground mt-1">
          담당자 확인 후 가능여부를 회신드리겠습니다.
        </p>
        <Button
          variant="outline"
          className="mt-5 rounded-full bg-background"
          onClick={() => { setDone(false); setOpen(false); }}
        >
          닫기
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          UPLOAD YOUR WORK
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">내 창작물 올리기</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          위미에 나만의 창작물을 올려보세요. 담당자 검토 후 게시됩니다.
        </p>
        {!open && (
          <Button
            onClick={() => setOpen(true)}
            className="mt-5 rounded-full px-8 font-bold"
          >
            <Send size={15} className="mr-2" />
            신청하기
          </Button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onSubmit={handleSubmit}
            className="mt-8 mx-auto max-w-lg bg-card rounded-3xl border border-border p-6 space-y-4"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                작가명 *
              </label>
              <Input
                value={form.authorName}
                onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                placeholder="작가명 또는 필명"
                required
                className="mt-1.5 h-10 rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                이메일 *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="회신받을 이메일 주소"
                required
                className="mt-1.5 h-10 rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                작품 소개 * (200자 이상)
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="어떤 작품을 올리고 싶으신가요? 장르, 줄거리, 특징 등을 200자 이상 작성해주세요."
                rows={6}
                required
                className="mt-1.5 rounded-xl bg-background"
              />
              <p className={`text-right text-xs mt-1 ${form.description.length < 200 ? "text-destructive" : "text-muted-foreground"}`}>
                {form.description.length} / 200자 이상
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                className="flex-1 rounded-full font-bold"
                disabled={
                  !form.authorName ||
                  !form.email ||
                  form.description.length < 200 ||
                  submit.isPending
                }
              >
                {submit.isPending ? "전송 중..." : "신청하기"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-background"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
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

      <SubmissionForm />
    </div>
  );
}
