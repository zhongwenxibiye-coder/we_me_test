import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine, Loader2, Clock, User, MessageCircle, Send, Trash2,
  CornerDownRight, ChevronLeft, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextArea } from "@/components/RichTextArea";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { Link } from "wouter";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  nickname: string | null;
  department: string | null;
  comment_count?: number;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  nickname: string | null;
  content: string;
  created_at: string;
  parent_id: string | null;
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

function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

// ── 대댓글 입력 폼 ─────────────────────────────────────────────

function ReplyForm({
  parentNickname,
  onSubmit,
  onCancel,
}: {
  parentNickname: string | null;
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit(text.trim());
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="ml-10 mt-1 mb-2"
    >
      <div className="rounded-xl border border-border/70 bg-background/70 p-3">
        {parentNickname && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <CornerDownRight size={11} />
            <span className="font-semibold">{parentNickname}</span>님께 답글
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) void handleSubmit(e as unknown as React.FormEvent);
              }
              if (e.key === "Escape") onCancel();
            }}
            placeholder="답글 입력… (Enter 등록, Esc 취소)"
            rows={2}
            maxLength={500}
            className="flex-1 resize-none text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
          />
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {submitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              등록
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// ── 대댓글 아이템 ────────────────────────────────────────────

function ReplyItem({
  reply,
  currentUserId,
  onDelete,
}: {
  reply: Comment;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  return (
    <div className="group flex gap-2.5 py-2 px-2 rounded-lg hover:bg-background/50 transition-colors">
      <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
        {(reply.nickname ?? "?")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold">{reply.nickname ?? "익명"}</span>
          <span className="text-xs text-muted-foreground/50">{timeAgo(reply.created_at)}</span>
        </div>
        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words text-foreground/80">{reply.content}</p>
        {currentUserId === reply.user_id && (
          <div className="mt-1">
            {deleteConfirm ? (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-destructive">삭제할까요?</span>
                <button onClick={() => onDelete(reply.id)} className="text-xs text-destructive font-semibold hover:underline">삭제</button>
                <button onClick={() => setDeleteConfirm(false)} className="text-xs text-muted-foreground hover:underline">취소</button>
              </span>
            ) : (
              <button onClick={() => setDeleteConfirm(true)} className="text-xs text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <Trash2 size={10} />삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 단일 댓글 ────────────────────────────────────────────────

function CommentItem({
  comment, replies, currentUserId, isLoggedIn, onReply, onDelete,
}: {
  comment: Comment;
  replies: Comment[];
  currentUserId: string | undefined;
  isLoggedIn: boolean;
  onReply: (parentId: string, parentNickname: string | null, text: string) => Promise<void>;
  onDelete: (commentId: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <div>
      <div className="group flex gap-3 py-3 px-3 rounded-xl hover:bg-background/60 transition-colors border-b border-border/30 last:border-0">
        <div className="size-7 rounded-full bg-secondary/40 flex items-center justify-center text-xs font-bold text-secondary-foreground shrink-0 mt-0.5">
          {(comment.nickname ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold">{comment.nickname ?? "익명"}</span>
            <span className="text-xs text-muted-foreground/60">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/85">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {isLoggedIn && (
              <button
                onClick={() => { setReplyOpen((v) => !v); setDeleteConfirm(false); }}
                className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                <CornerDownRight size={11} />{replyOpen ? "취소" : "답글"}
              </button>
            )}
            {currentUserId === comment.user_id && (
              deleteConfirm ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-destructive">삭제?</span>
                  <button onClick={() => onDelete(comment.id)} className="text-xs text-destructive font-semibold hover:underline">삭제</button>
                  <button onClick={() => setDeleteConfirm(false)} className="text-xs text-muted-foreground hover:underline">취소</button>
                </span>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="text-xs text-muted-foreground/40 hover:text-destructive transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={11} />삭제
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {replyOpen && (
          <ReplyForm
            parentNickname={comment.nickname}
            onSubmit={async (text) => { await onReply(comment.id, comment.nickname, text); setReplyOpen(false); }}
            onCancel={() => setReplyOpen(false)}
          />
        )}
      </AnimatePresence>
      {replies.length > 0 && (
        <div className="ml-10 border-l-2 border-primary/15 pl-3 mt-0.5">
          {replies.map((r) => (
            <ReplyItem key={r.id} reply={r} currentUserId={currentUserId} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 댓글 영역 ────────────────────────────────────────────────

function CommentsSection({ postId }: { postId: string }) {
  const { user, nickname } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    supabase
      .from("comments")
      .select("id, post_id, user_id, nickname, content, created_at, parent_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setComments(data as Comment[]);
        setLoading(false);
      });
  }, [postId]);

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesMap: Record<string, Comment[]> = {};
  comments.filter((c) => c.parent_id).forEach((c) => {
    repliesMap[c.parent_id!] = [...(repliesMap[c.parent_id!] ?? []), c];
  });

  const insertComment = async (content: string, parentId: string | null): Promise<Comment | null> => {
    if (!user) return null;
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, nickname: nickname ?? null, content, parent_id: parentId })
      .select()
      .single();
    if (error || !data) return null;
    return data as Comment;
  };

  const handleSubmitTop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      nickname: nickname ?? null,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
      parent_id: null,
    };
    setComments((prev) => [...prev, optimistic]);
    setCommentText("");
    setSubmitting(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    const created = await insertComment(optimistic.content, null);
    setSubmitting(false);
    setComments((prev) =>
      created ? prev.map((c) => (c.id === optimistic.id ? created : c)) : prev.filter((c) => c.id !== optimistic.id)
    );
  };

  const handleReply = async (parentId: string, _parentNickname: string | null, text: string) => {
    if (!user) return;
    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      nickname: nickname ?? null,
      content: text,
      created_at: new Date().toISOString(),
      parent_id: parentId,
    };
    setComments((prev) => [...prev, optimistic]);
    const created = await insertComment(text, parentId);
    setComments((prev) =>
      created ? prev.map((c) => (c.id === optimistic.id ? created : c)) : prev.filter((c) => c.id !== optimistic.id)
    );
  };

  const handleDelete = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
    const supabase = getSupabase();
    if (supabase) await supabase.from("comments").delete().eq("id", commentId);
  };

  return (
    <div>
      {/* 댓글 입력 */}
      <div className="mb-4">
        {user ? (
          <form onSubmit={handleSubmitTop} className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="댓글을 입력하세요…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (commentText.trim()) void handleSubmitTop(e as unknown as React.FormEvent);
                  }
                }}
                rows={2}
                className="resize-none text-sm rounded-xl"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground/50 mt-1">Enter 등록 · Shift+Enter 줄바꿈</p>
            </div>
            <Button type="submit" size="sm" disabled={submitting || !commentText.trim()} className="mb-5 gap-1.5 rounded-xl shrink-0">
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}등록
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-background/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">댓글을 달려면 로그인이 필요해요.</p>
            <Link href="/login"><Button size="sm" variant="outline" className="rounded-lg text-xs h-7">로그인</Button></Link>
          </div>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
          <MessageCircle size={13} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            댓글 {loading ? "…" : comments.length}개
          </span>
        </div>
        <div className="px-2 py-2">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-muted-foreground" /></div>
          ) : topLevel.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-4 text-center">첫 댓글을 남겨보세요!</p>
          ) : (
            <div>
              {topLevel.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={repliesMap[comment.id] ?? []}
                  currentUserId={user?.id}
                  isLoggedIn={!!user}
                  onReply={handleReply}
                  onDelete={handleDelete}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 게시글 상세 뷰 ────────────────────────────────────────────

function PostDetail({
  post,
  currentUserId,
  onDelete,
  onClose,
  totalPosts,
  postIndex,
}: {
  post: Post;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
  onClose: () => void;
  totalPosts: number;
  postIndex: number;
}) {
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [post.id]);

  return (
    <div ref={detailRef} className="rounded-2xl border border-card-border bg-card overflow-hidden mb-2">
      {/* 게시글 헤더 */}
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold leading-snug tracking-tight">{post.title}</h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User size={10} />
                <span className="font-medium">{post.nickname ?? "익명"}</span>
                {post.department && (
                  <span className="ml-0.5 text-[10px] bg-primary/10 text-primary/80 rounded px-1.5 py-px font-semibold">{post.department}</span>
                )}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(post.created_at)}</span>
              <span>·</span>
              <span className="text-muted-foreground/50">{totalPosts - postIndex}번 글</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            title="목록으로"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 게시글 본문 */}
      <div className="px-5 py-5">
        <p className="text-sm leading-loose whitespace-pre-wrap text-foreground/85 min-h-[80px]">{post.content}</p>
        {currentUserId === post.user_id && (
          <div className="mt-4 flex justify-end border-t border-border/40 pt-3">
            <button
              onClick={() => { onDelete(post.id); onClose(); }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              게시글 삭제
            </button>
          </div>
        )}
      </div>

      {/* 댓글 */}
      <div className="px-5 pb-6 border-t border-border/40 pt-5 bg-muted/20">
        <CommentsSection postId={post.id} />
      </div>
    </div>
  );
}

// ── 게시글 행 (테이블 형식) ───────────────────────────────────

function PostRow({
  post,
  index,
  totalPosts,
  isSelected,
  onClick,
}: {
  post: Post;
  index: number;
  totalPosts: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-b border-border/40 last:border-0 px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-center gap-3 ${isSelected ? "bg-primary/8" : ""}`}
    >
      {/* 번호 */}
      <span className="text-xs text-muted-foreground/50 w-7 shrink-0 text-right tabular-nums">
        {totalPosts - index}
      </span>
      {/* 제목 + 댓글수 */}
      <span className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className={`text-sm truncate font-medium ${isSelected ? "text-primary font-semibold" : ""}`}>
          {post.title}
        </span>
        {(post.comment_count ?? 0) > 0 && (
          <span className="shrink-0 text-[10px] font-bold text-primary/70 bg-primary/10 rounded px-1.5 py-px">
            [{post.comment_count}]
          </span>
        )}
      </span>
      {/* 글쓴이 + 학과 */}
      <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground w-28 justify-end">
        <span className="truncate max-w-[60px]">{post.nickname ?? "익명"}</span>
        {post.department && (
          <span className="text-[9px] bg-primary/10 text-primary/70 rounded px-1 py-px font-medium shrink-0">{post.department}</span>
        )}
      </span>
      {/* 날짜 */}
      <span className="shrink-0 text-xs text-muted-foreground/60 w-14 text-right tabular-nums">
        {shortDate(post.created_at)}
      </span>
    </button>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────

export default function Community() {
  const { user, nickname, department } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async () => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    const { data, error: err } = await supabase
      .from("posts")
      .select("id, title, content, created_at, user_id, nickname, department, comments(count)")
      .order("created_at", { ascending: false });
    if (!err && data) {
      const mapped = (data as (Post & { comments: { count: number }[] })[]).map((p) => ({
        ...p,
        comment_count: p.comments?.[0]?.count ?? 0,
      }));
      setPosts(mapped);
      // 선택된 게시글이 있으면 업데이트
      if (selectedPost) {
        const updated = mapped.find((p) => p.id === selectedPost.id);
        if (updated) setSelectedPost(updated);
      }
    }
    setLoading(false);
  };

  useEffect(() => { void fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) { setError("서비스를 불러오는 중입니다."); return; }
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase
      .from("posts")
      .insert({ title: title.trim(), content: content.trim(), user_id: user.id, nickname: nickname ?? null, department: department ?? null });
    setSubmitting(false);
    if (err) { setError("글 등록 중 오류가 발생했습니다."); }
    else { setTitle(""); setContent(""); setShowForm(false); void fetchPosts(); }
  };

  const handleDeletePost = async (postId: string) => {
    const supabase = getSupabase();
    if (supabase) await supabase.from("posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  const handleSelectPost = (post: Post) => {
    if (selectedPost?.id === post.id) {
      setSelectedPost(null);
    } else {
      setSelectedPost(post);
      setShowForm(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 py-10 lg:py-14" ref={topRef}>
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "hsl(88 45% 38%)" }}>Community</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">커뮤니티</h1>
            <p className="text-muted-foreground text-sm mt-1">인문계 취준생끼리 솔직하게 고민을 나눠요. 이름 없이, 부담 없이.</p>
          </div>
          {user ? (
            <Button
              onClick={() => { setShowForm((v) => !v); setSelectedPost(null); }}
              className="shrink-0 gap-2 rounded-xl"
              variant={showForm ? "outline" : "default"}
            >
              <PenLine size={14} />
              {showForm ? "취소" : "글쓰기"}
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="shrink-0 gap-2 rounded-xl">
                <PenLine size={14} />로그인 후 작성
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* 글쓰기 폼 */}
      <AnimatePresence>
        {showForm && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-card-border bg-card p-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                <PenLine size={14} className="text-primary" />새 글 작성
                {nickname && <span className="text-xs text-muted-foreground font-normal">({nickname} 으로 게시)</span>}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="post-title" className="text-xs">제목</Label>
                  <Input id="post-title" placeholder="고민이나 질문을 요약해 주세요" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="post-content" className="text-xs">내용</Label>
                  <RichTextArea value={content} onChange={setContent} rows={5} placeholder="자유롭게 고민을 적어보세요." />
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>취소</Button>
                  <Button type="submit" size="sm" disabled={submitting || !title.trim() || !content.trim()}>
                    {submitting && <Loader2 size={13} className="mr-1.5 animate-spin" />}등록
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 선택된 게시글 상세 */}
      <AnimatePresence mode="wait">
        {selectedPost && (
          <motion.div
            key={selectedPost.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <PostDetail
              post={selectedPost}
              currentUserId={user?.id}
              onDelete={handleDeletePost}
              onClose={() => setSelectedPost(null)}
              totalPosts={posts.length}
              postIndex={posts.findIndex((p) => p.id === selectedPost.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 게시판 테이블 */}
      <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/40 border-b border-border/60 text-xs text-muted-foreground font-semibold">
          <span className="w-7 shrink-0 text-right">번호</span>
          <span className="flex-1">제목</span>
          <span className="w-28 text-right">글쓴이</span>
          <span className="w-14 text-right">날짜</span>
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 size={22} className="animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-muted-foreground text-sm">아직 게시글이 없어요.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">첫 글을 작성해보세요!</p>
          </div>
        ) : (
          <div>
            {posts.map((post, i) => (
              <PostRow
                key={post.id}
                post={post}
                index={i}
                totalPosts={posts.length}
                isSelected={selectedPost?.id === post.id}
                onClick={() => handleSelectPost(post)}
              />
            ))}
          </div>
        )}

        {/* 하단 */}
        <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">총 {posts.length}개 글</span>
          {selectedPost && (
            <button
              onClick={() => setSelectedPost(null)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={12} />목록만 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
