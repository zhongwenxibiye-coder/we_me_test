import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine, ChevronDown, ChevronUp, Loader2, Clock,
  User, MessageCircle, Send, Trash2, CornerDownRight,
} from "lucide-react";
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
  user_id: string;
  nickname: string | null;
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

// ── 대댓글 입력 폼 ──────────────────────────────────────────

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
      transition={{ duration: 0.18 }}
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
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) void handleSubmit(e as unknown as React.FormEvent);
              }
              if (e.key === "Escape") onCancel();
            }}
            placeholder="답글을 입력하세요… (Enter 등록, Esc 취소)"
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

// ── 단일 댓글 (+ 대댓글 목록) ────────────────────────────────

function CommentItem({
  comment,
  replies,
  currentUserId,
  isLoggedIn,
  onReply,
  onDelete,
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
      {/* 부모 댓글 */}
      <div className="group flex gap-3 py-2.5 px-3 rounded-xl hover:bg-background/60 transition-colors">
        <div className="size-7 rounded-full bg-secondary/40 flex items-center justify-center text-xs font-bold text-secondary-foreground shrink-0 mt-0.5">
          {(comment.nickname ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-foreground">
              {comment.nickname ?? "익명"}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          {/* 액션 버튼 */}
          <div className="flex items-center gap-3 mt-1.5">
            {isLoggedIn && (
              <button
                onClick={() => { setReplyOpen((v) => !v); setDeleteConfirm(false); }}
                className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                <CornerDownRight size={11} />
                {replyOpen ? "취소" : "답글 달기"}
              </button>
            )}
            {currentUserId === comment.user_id && (
              deleteConfirm ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-destructive">삭제할까요?</span>
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

      {/* 대댓글 입력 폼 */}
      <AnimatePresence>
        {replyOpen && (
          <ReplyForm
            parentNickname={comment.nickname}
            onSubmit={async (text) => {
              await onReply(comment.id, comment.nickname, text);
              setReplyOpen(false);
            }}
            onCancel={() => setReplyOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 대댓글 목록 */}
      {replies.length > 0 && (
        <div className="ml-10 border-l-2 border-primary/15 pl-3 mt-0.5 space-y-0">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserId={currentUserId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
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
          <span className="text-xs font-semibold text-foreground">
            {reply.nickname ?? "익명"}
          </span>
          <span className="text-xs text-muted-foreground/50">
            {timeAgo(reply.created_at)}
          </span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
          {reply.content}
        </p>
        {currentUserId === reply.user_id && (
          <div className="mt-1">
            {deleteConfirm ? (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-destructive">삭제할까요?</span>
                <button onClick={() => onDelete(reply.id)} className="text-xs text-destructive font-semibold hover:underline">삭제</button>
                <button onClick={() => setDeleteConfirm(false)} className="text-xs text-muted-foreground hover:underline">취소</button>
              </span>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-xs text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Trash2 size={10} />삭제
              </button>
            )}
          </div>
        )}
      </div>
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

  // 트리 구조: top-level + replies map
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesMap: Record<string, Comment[]> = {};
  comments.filter((c) => c.parent_id).forEach((c) => {
    repliesMap[c.parent_id!] = [...(repliesMap[c.parent_id!] ?? []), c];
  });

  const totalCount = comments.length;

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

  // 최상위 댓글 등록
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
      created
        ? prev.map((c) => (c.id === optimistic.id ? created : c))
        : prev.filter((c) => c.id !== optimistic.id)
    );
  };

  // 대댓글 등록
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
      created
        ? prev.map((c) => (c.id === optimistic.id ? created : c))
        : prev.filter((c) => c.id !== optimistic.id)
    );
  };

  const handleDelete = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
    const supabase = getSupabase();
    if (supabase) await supabase.from("comments").delete().eq("id", commentId);
  };

  return (
    <div className="border-t border-border/60 bg-muted/20">
      {/* 댓글 목록 */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
          <MessageCircle size={12} />
          댓글 {loading ? "…" : totalCount}개
        </p>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : totalCount === 0 ? (
          <p className="text-xs text-muted-foreground/60 py-3 text-center">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </p>
        ) : (
          <div className="space-y-0.5">
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

      {/* 최상위 댓글 입력 */}
      <div className="px-6 pb-5 pt-2">
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
              <p className="text-xs text-muted-foreground/50 mt-1">
                Enter 등록 · Shift+Enter 줄바꿈
              </p>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !commentText.trim()}
              className="mb-5 gap-1.5 rounded-xl shrink-0"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              등록
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-background/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">댓글을 달려면 로그인이 필요해요.</p>
            <Link href="/login">
              <Button size="sm" variant="outline" className="rounded-lg text-xs h-7">로그인</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 게시글 카드 ──────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onDelete,
}: {
  post: Post;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-card-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-6 py-4 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="font-semibold text-sm leading-snug">{post.title}</span>
          {expanded
            ? <ChevronUp size={15} className="text-muted-foreground shrink-0 mt-0.5" />
            : <ChevronDown size={15} className="text-muted-foreground shrink-0 mt-0.5" />}
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User size={10} />{post.nickname ?? "익명"}</span>
          <span>·</span>
          <Clock size={11} /><span>{timeAgo(post.created_at)}</span>
          {!expanded && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5"><MessageCircle size={10} />댓글 {post.comment_count ?? 0}</span>
              <span className="ml-1 line-clamp-1 text-muted-foreground/60">
                — {post.content.slice(0, 50)}{post.content.length > 50 ? "…" : ""}
              </span>
            </>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-t border-border/60">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{post.content}</p>
              {currentUserId === post.user_id && (
                <div className="mt-3 flex justify-end">
                  <button onClick={() => onDelete(post.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    게시글 삭제
                  </button>
                </div>
              )}
            </div>
            <CommentsSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────

export default function Community() {
  const { user, nickname } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    const { data, error: err } = await supabase
      .from("posts")
      .select("id, title, content, created_at, user_id, nickname, comments(count)")
      .order("created_at", { ascending: false });
    if (!err && data) {
      setPosts(
        (data as (Post & { comments: { count: number }[] })[]).map((p) => ({
          ...p,
          comment_count: p.comments?.[0]?.count ?? 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) { setError("서비스를 불러오는 중입니다."); return; }
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase
      .from("posts")
      .insert({ title: title.trim(), content: content.trim(), user_id: user.id, nickname: nickname ?? null });
    setSubmitting(false);
    if (err) { setError("글 등록 중 오류가 발생했습니다. 다시 시도해 주세요."); }
    else { setTitle(""); setContent(""); setShowForm(false); fetchPosts(); }
  };

  const handleDeletePost = async (postId: string) => {
    const supabase = getSupabase();
    if (supabase) await supabase.from("posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "hsl(88 45% 38%)" }}>Community</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">익명 취업 고민 게시판</h1>
        <p className="text-muted-foreground text-sm">인문계 취준생끼리 솔직하게 고민을 나눠요. 이름 없이, 부담 없이.</p>
      </motion.div>

      {/* 글쓰기 폼 */}
      {user ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-3xl border border-card-border bg-card overflow-hidden">
          <button onClick={() => setShowForm((v) => !v)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <PenLine size={16} className="text-primary" />새 글 쓰기
              {nickname && <span className="text-xs text-muted-foreground font-normal">({nickname} 으로 게시)</span>}
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
                    <Textarea id="post-content" placeholder="자유롭게 고민을 적어보세요." value={content} onChange={(e) => setContent(e.target.value)} required rows={5} className="resize-none" />
                  </div>
                  {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>취소</Button>
                    <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
                      {submitting && <Loader2 size={14} className="mr-1.5 animate-spin" />}등록
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
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <PostCard post={post} currentUserId={user?.id} onDelete={handleDeletePost} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
