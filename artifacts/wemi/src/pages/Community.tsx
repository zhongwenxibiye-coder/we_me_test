import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, ChevronDown, ChevronUp, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { Link } from "wouter";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPosts = async () => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    const { data, error: err } = await supabase
      .from("posts")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false });
    if (!err && data) setPosts(data as Post[]);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) { setError("서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요."); return; }
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase
      .from("posts")
      .insert({ title: title.trim(), content: content.trim(), user_id: user.id });
    setSubmitting(false);
    if (err) {
      setError("글 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } else {
      setTitle(""); setContent(""); setShowForm(false);
      fetchPosts();
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    const supabase = getSupabase();
    if (supabase) await supabase.from("posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (expanded === postId) setExpanded(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "hsl(88 45% 38%)" }}>
          Community
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">익명 취업 고민 게시판</h1>
        <p className="text-muted-foreground text-sm">
          인문계 취준생끼리 솔직하게 고민을 나눠요. 이름 없이, 부담 없이.
        </p>
      </motion.div>

      {/* 글쓰기 */}
      {user ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-3xl border border-card-border bg-card overflow-hidden">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <PenLine size={16} className="text-primary" />새 글 쓰기
            </span>
            {showForm ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-border/60">
                  <div className="space-y-1.5 pt-4">
                    <Label htmlFor="post-title">제목</Label>
                    <Input id="post-title" placeholder="고민이나 질문을 요약해 주세요" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="post-content">내용</Label>
                    <Textarea id="post-content" placeholder="자유롭게 고민을 적어보세요. 익명으로 게시됩니다." value={content} onChange={(e) => setContent(e.target.value)} required rows={5} className="resize-none" />
                  </div>
                  {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>취소</Button>
                    <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
                      {submitting && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                      익명으로 등록
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-3xl border border-dashed border-border bg-muted/30 px-6 py-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">글을 작성하려면 로그인이 필요해요.</p>
          <Link href="/login"><Button size="sm">로그인</Button></Link>
        </motion.div>
      )}

      {/* 게시글 목록 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">🌱</p>
          <p className="font-medium">아직 게시글이 없어요.</p>
          <p className="text-sm mt-1">첫 번째 고민을 나눠보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl border border-card-border bg-card overflow-hidden">
              <button
                onClick={() => setExpanded((v) => (v === post.id ? null : post.id))}
                className="w-full text-left px-6 py-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-sm leading-snug">{post.title}</span>
                  {expanded === post.id
                    ? <ChevronUp size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                    : <ChevronDown size={15} className="text-muted-foreground shrink-0 mt-0.5" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>{timeAgo(post.created_at)}</span>
                  {expanded !== post.id && (
                    <span className="ml-1 line-clamp-1 text-muted-foreground/70">
                      — {post.content.slice(0, 60)}{post.content.length > 60 ? "…" : ""}
                    </span>
                  )}
                </div>
              </button>
              <AnimatePresence>
                {expanded === post.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="border-t border-border/60">
                    <div className="px-6 py-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{post.content}</p>
                      {user && (
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => handleDelete(post.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">삭제</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
