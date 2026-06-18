import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Inbox, Lock, Mail, CheckCircle2, Clock, LogOut, Users, Briefcase,
  Rocket, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Eye, PenLine, ImageIcon,
  BookOpen, HelpCircle, FileText, Send, UserCheck, UserX, RefreshCw, Heart,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { Link } from "wouter";
import {
  useListMentorApplications, useUpdateMentorApplicationStatus,
  getListMentorApplicationsQueryKey, type MentorApplication,
  useListMentors, useCreateMentor, useUpdateMentor, useDeleteMentor, type MentorProfile,
  getListMentorsQueryKey,
  useListMentorArticles, useCreateMentorArticle, useUpdateMentorArticle, useDeleteMentorArticle,
  getGetMentorQueryKey,
  useListJobListings, useCreateJobListing, useUpdateJobListing, useDeleteJobListing, type JobListing,
  getListJobListingsQueryKey,
  useListStartupApplications, useUpdateStartupApplicationResult, type StartupApplication,
  getListStartupApplicationsQueryKey,
  useListCreativeWorks, useCreateCreativeWork, useUpdateCreativeWork, useDeleteCreativeWork,
  getListCreativeWorksQueryKey, type CreativeWork,
  useListCreativeEpisodes, useCreateCreativeEpisode, useUpdateCreativeEpisode, useDeleteCreativeEpisode,
  getListCreativeEpisodesQueryKey, type CreativeEpisode,
  useListCreativeWorkSubmissions, useUpdateCreativeWorkSubmissionStatus,
  getListCreativeWorkSubmissionsQueryKey,
  useListHumanitiesQuizzes, useCreateHumanitiesQuiz, useUpdateHumanitiesQuiz, useDeleteHumanitiesQuiz,
  getListHumanitiesQuizzesQueryKey,
  useListHumanitiesArticles, useCreateHumanitiesArticle, useUpdateHumanitiesArticle, useDeleteHumanitiesArticle,
  getListHumanitiesArticlesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mascot } from "@/components/Mascot";

const STORAGE_KEY = "wemi-admin-password";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUpload({
  value,
  onChange,
  label = "이미지",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1.5 flex items-center gap-3 flex-wrap">
        {value && (
          <img
            src={value}
            alt="미리보기"
            className="size-16 rounded-xl object-cover border border-border bg-muted/40"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/40 transition-colors"
        >
          📁 파일 선택
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            제거
          </button>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) fileToBase64(file).then(onChange);
            e.target.value = "";
          }}
        />
      </div>
      {!value && (
        <p className="text-xs text-muted-foreground mt-1">이미지를 선택하면 미리보기가 표시됩니다.</p>
      )}
    </div>
  );
}

type Tab = "applications" | "mentors" | "jobs" | "startup" | "creative" | "humanities" | "users";

function formatDate(value: string | Date): string {
  const d = new Date(value as string);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(d);
}

// ── Tab: 멘토링 신청함 ──────────────────────────────────────

function ApplicationsTab({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const query = useListMentorApplications<MentorApplication[]>({ request: ro });
  const updateStatus = useUpdateMentorApplicationStatus({ request: ro });
  const { data: mentors = [] } = useListMentors<MentorProfile[]>();

  const applications = query.data ?? [];
  const newCount = applications.filter((a) => a.status === "new").length;

  function getMentorName(mentorId: string): string {
    const m = (mentors as MentorProfile[]).find((m) => String(m.id) === mentorId);
    return m ? m.name : `멘토 #${mentorId}`;
  }

  if (query.isLoading) return <div className="py-10 text-center text-muted-foreground">불러오는 중...</div>;

  function handleToggle(app: MentorApplication) {
    const next = app.status === "read" ? "new" : "read";
    updateStatus.mutate(
      { id: app.id, data: { status: next } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMentorApplicationsQueryKey() }) },
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          전체 {applications.length}건 · 새 신청 <span className="font-bold text-foreground">{newCount}</span>건
        </p>
      </div>
      {applications.length === 0 ? (
        <div className="rounded-3xl bg-card border border-card-border p-10 text-center">
          <Mascot size={80} animate="bob" />
          <p className="mt-4 font-semibold">아직 신청이 없어요</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {applications.map((app, i) => (
            <motion.li key={app.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`rounded-3xl border p-5 ${app.status === "new" ? "bg-card border-primary/40" : "bg-card/60 border-card-border"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-extrabold">{app.name}</span>
                    {app.status === "new"
                      ? <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary" style={{ color: "hsl(35 60% 20%)" }}>새 신청</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">확인함</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-secondary/30 text-secondary-foreground rounded-full px-2.5 py-0.5">
                      <UserCheck size={11} />→ {getMentorName(app.mentorId)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={11} />{formatDate(app.createdAt)}</span>
                    <span className="flex items-center gap-1"><Mail size={11} />{app.contact}</span>
                  </div>
                </div>
                <Button size="sm" variant={app.status === "new" ? "default" : "outline"}
                  className={app.status !== "new" ? "bg-card rounded-full" : "rounded-full"}
                  disabled={updateStatus.isPending} onClick={() => handleToggle(app)}>
                  {app.status === "new" ? <><CheckCircle2 size={13} className="mr-1" />확인함</> : "새로 표시"}
                </Button>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-xs text-muted-foreground">주제</span><p className="font-medium">{app.topic}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground">메시지</p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{app.message}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );
}

// ── Tab: 멘토 관리 ──────────────────────────────────────────

type MentorFormData = {
  name: string; major: string; yearsOfExperience: string;
  photoUrl: string; headlineText: string; sublineText: string;
  bio: string; avatarColor: string; initial: string;
  isActive: boolean; displayOrder: string;
};

const MENTOR_FORM_DEFAULTS: MentorFormData = {
  name: "", major: "", yearsOfExperience: "0", photoUrl: "",
  headlineText: "", sublineText: "", bio: "",
  avatarColor: "bg-amber-200", initial: "", isActive: true, displayOrder: "1",
};

function MentorsTab({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const { data: mentors = [], isLoading } = useListMentors<MentorProfile[]>();
  const createMentor = useCreateMentor({ request: ro });
  const updateMentor = useUpdateMentor({ request: ro });
  const deleteMentor = useDeleteMentor({ request: ro });

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<MentorFormData>(MENTOR_FORM_DEFAULTS);
  const [expandedArticles, setExpandedArticles] = useState<number | null>(null);

  function startNew() { setForm(MENTOR_FORM_DEFAULTS); setEditing("new"); }
  function startEdit(m: MentorProfile) {
    setForm({
      name: m.name, major: m.major,
      yearsOfExperience: String(m.yearsOfExperience),
      photoUrl: m.photoUrl ?? "", headlineText: m.headlineText,
      sublineText: m.sublineText, bio: m.bio,
      avatarColor: m.avatarColor, initial: m.initial,
      isActive: m.isActive, displayOrder: String(m.displayOrder),
    });
    setEditing(m.id);
  }

  function handleSave() {
    const payload = {
      name: form.name, major: form.major,
      yearsOfExperience: Number(form.yearsOfExperience),
      photoUrl: form.photoUrl || null,
      headlineText: form.headlineText, sublineText: form.sublineText,
      bio: form.bio, avatarColor: form.avatarColor, initial: form.initial,
      isActive: form.isActive, displayOrder: Number(form.displayOrder),
    };
    if (editing === "new") {
      createMentor.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListMentorsQueryKey() }); setEditing(null); },
      });
    } else if (typeof editing === "number") {
      updateMentor.mutate({ id: editing, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListMentorsQueryKey() }); setEditing(null); },
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠어요?")) return;
    deleteMentor.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMentorsQueryKey() }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">멘토 {mentors.length}명</p>
        <Button size="sm" className="rounded-full" onClick={startNew}>
          <Plus size={14} className="mr-1" /> 멘토 추가
        </Button>
      </div>

      {editing !== null && (
        <div className="rounded-3xl bg-card border-2 border-primary/30 p-5 space-y-4">
          <h3 className="font-extrabold text-lg">{editing === "new" ? "새 멘토 추가" : "멘토 수정"}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {(["name", "major", "initial"] as const).map((k) => (
              <div key={k}>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</label>
                <Input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="mt-1 h-9 rounded-xl bg-background" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">경력(년)</label>
              <Input type="number" value={form.yearsOfExperience} onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))} className="mt-1 h-9 rounded-xl bg-background" />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload label="프로필 사진 (선택)" value={form.photoUrl} onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))} />
            </div>
          </div>
          {(["headlineText", "sublineText", "bio"] as const).map((k) => (
            <div key={k}>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</label>
              <Textarea value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="mt-1 rounded-xl bg-background" />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">순서</label>
              <Input type="number" min="1" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className="h-8 w-20 rounded-xl bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full" onClick={handleSave} disabled={!form.name || !form.initial}>저장</Button>
            <Button size="sm" variant="outline" className="rounded-full bg-card" onClick={() => setEditing(null)}>취소</Button>
          </div>
        </div>
      )}

      {isLoading ? <div className="py-8 text-center text-muted-foreground">불러오는 중...</div> : (
        <ul className="space-y-3">
          {mentors.map((m: MentorProfile) => (
            <li key={m.id} className="rounded-3xl bg-card border border-card-border p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {m.photoUrl
                    ? <img src={m.photoUrl} alt={m.name} className="size-10 rounded-full object-cover" />
                    : <div className={`size-10 rounded-full ${m.avatarColor} flex items-center justify-center text-sm font-extrabold`} style={{ color: "hsl(30 50% 25%)" }}>{m.initial}</div>}
                  <div>
                    <p className="font-extrabold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.major} · {m.yearsOfExperience}년 · {m.isActive ? "활성" : "비활성"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full bg-card h-8"
                    onClick={() => setExpandedArticles(expandedArticles === m.id ? null : m.id)}>
                    {expandedArticles === m.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <span className="ml-1 text-xs">아티클</span>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full bg-card h-8" onClick={() => startEdit(m)}><Pencil size={13} /></Button>
                  <Button size="sm" variant="outline" className="rounded-full bg-card h-8 text-destructive" onClick={() => handleDelete(m.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
              {expandedArticles === m.id && (
                <ArticleManager mentorId={m.id} password={password} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ArticleManager({ mentorId, password }: { mentorId: number; password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const { data: articles = [], isLoading } = useListMentorArticles(mentorId);
  const createArticle = useCreateMentorArticle({ request: ro });
  const updateArticle = useUpdateMentorArticle({ request: ro });
  const deleteArticle = useDeleteMentorArticle({ request: ro });

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ title: "", content: "", displayOrder: "1", isActive: true });

  function startNew() { setForm({ title: "", content: "", displayOrder: "1", isActive: true }); setEditing("new"); }
  function startEdit(a: { id: number; title: string; content: string; displayOrder: number; isActive: boolean }) {
    setForm({ title: a.title, content: a.content, displayOrder: String(a.displayOrder), isActive: a.isActive });
    setEditing(a.id);
  }

  function handleSave() {
    const payload = { title: form.title, content: form.content, displayOrder: Number(form.displayOrder), isActive: form.isActive };
    if (editing === "new") {
      createArticle.mutate({ mentorId, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMentorQueryKey(mentorId) }); setEditing(null); },
      });
    } else if (typeof editing === "number") {
      updateArticle.mutate({ id: editing, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMentorQueryKey(mentorId) }); setEditing(null); },
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("아티클을 삭제할까요?")) return;
    deleteArticle.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMentorQueryKey(mentorId) }),
    });
  }

  return (
    <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">아티클 목록</p>
        <Button size="sm" variant="outline" className="rounded-full bg-background h-7 text-xs" onClick={startNew}>
          <Plus size={12} className="mr-1" />추가
        </Button>
      </div>
      {editing !== null && (
        <div className="bg-background rounded-2xl border border-border p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold">제목</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 h-9 rounded-xl bg-card" />
          </div>
          <div>
            <label className="text-xs font-semibold">내용</label>
            <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} className="mt-1 rounded-xl bg-card" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
            </label>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">순서</label>
              <Input type="number" min="1" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className="h-7 w-16 rounded-lg bg-card" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 rounded-full text-xs" onClick={handleSave} disabled={!form.title}>저장</Button>
            <Button size="sm" variant="outline" className="h-7 rounded-full text-xs bg-card" onClick={() => setEditing(null)}>취소</Button>
          </div>
        </div>
      )}
      {isLoading ? <p className="text-xs text-muted-foreground">불러오는 중...</p> : (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 bg-background rounded-xl border border-border px-4 py-2.5">
              <span className={`text-sm font-medium ${!a.isActive ? "text-muted-foreground line-through" : ""}`}>{a.title}</span>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 rounded-full bg-card" onClick={() => startEdit(a)}><Pencil size={12} /></Button>
                <Button size="sm" variant="outline" className="h-7 rounded-full bg-card text-destructive" onClick={() => handleDelete(a.id)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Tab: 직무 학습 ──────────────────────────────────────────

const JOB_CATEGORIES = ["영업", "마케팅", "홍보", "기획", "일반사무/공공기관", "IR", "기타"];

type LearningItem = { title: string; content: string };
type JobFormData = { category: string; title: string; shortDescription: string; imageUrl: string; isActive: boolean; displayOrder: string; learning: LearningItem[] };
const JOB_FORM_DEFAULTS: JobFormData = { category: "영업", title: "", shortDescription: "", imageUrl: "", isActive: true, displayOrder: "1", learning: [] };

// ── 리치 텍스트 에디터 (마크다운 툴바) ──────────────────────
type FormatType = "bold" | "italic" | "h2" | "h3" | "bullet";

function RichTextArea({
  value, onChange, placeholder, rows = 5,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyFormat(type: FormatType) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    let newVal = value;
    let newStart = start;
    let newEnd = end;

    if (type === "bold") {
      newVal = value.slice(0, start) + `**${selected}**` + value.slice(end);
      newStart = start + 2; newEnd = end + 2;
    } else if (type === "italic") {
      newVal = value.slice(0, start) + `*${selected}*` + value.slice(end);
      newStart = start + 1; newEnd = end + 1;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const prefix = type === "h2" ? "## " : type === "h3" ? "### " : "- ";
      newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      newStart = start + prefix.length; newEnd = end + prefix.length;
    }

    onChange(newVal);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(newStart, newEnd); });
  }

  const toolbarBtns: { label: string; type: FormatType; title: string; className?: string }[] = [
    { label: "B", type: "bold", title: "볼드 — 텍스트 선택 후 클릭", className: "font-extrabold" },
    { label: "I", type: "italic", title: "기울임 — 텍스트 선택 후 클릭", className: "italic" },
    { label: "H2", type: "h2", title: "큰 소제목 (## )" },
    { label: "H3", type: "h3", title: "작은 소제목 (### )" },
    { label: "• 목록", type: "bullet", title: "글머리 기호 (- )" },
  ];

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
      {/* 툴바 */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-muted/40 flex-wrap">
        {toolbarBtns.map((btn, i) => (
          <>
            {(i === 2 || i === 4) && <div key={`sep-${i}`} className="w-px h-4 bg-border/60 mx-0.5" />}
            <button
              key={btn.type}
              type="button"
              title={btn.title}
              onClick={() => applyFormat(btn.type)}
              className={`px-2 py-0.5 rounded text-xs hover:bg-primary/20 transition-colors text-foreground/80 ${btn.className ?? ""}`}
            >
              {btn.label}
            </button>
          </>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground/40 hidden sm:inline">텍스트 선택 → 버튼 클릭</span>
      </div>
      {/* 텍스트 영역 */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y px-3 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed"
      />
    </div>
  );
}

function JobsTab({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const { data: jobs = [], isLoading } = useListJobListings<JobListing[]>();
  const createJob = useCreateJobListing({ request: ro });
  const updateJob = useUpdateJobListing({ request: ro });
  const deleteJob = useDeleteJobListing({ request: ro });

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<JobFormData>(JOB_FORM_DEFAULTS);

  function startNew() { setForm(JOB_FORM_DEFAULTS); setEditing("new"); }
  function startEdit(j: JobListing) {
    setForm({
      category: j.category, title: j.title,
      shortDescription: j.shortDescription, imageUrl: j.imageUrl ?? "",
      isActive: j.isActive, displayOrder: String(j.displayOrder),
      learning: (j.learning as LearningItem[] | null) ?? [],
    });
    setEditing(j.id);
  }

  function handleSave() {
    const payload = {
      category: form.category, title: form.title,
      shortDescription: form.shortDescription, imageUrl: form.imageUrl || null,
      isActive: form.isActive, displayOrder: Number(form.displayOrder),
      learning: form.learning,
    };
    if (editing === "new") {
      createJob.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListJobListingsQueryKey() }); setEditing(null); },
      });
    } else if (typeof editing === "number") {
      updateJob.mutate({ id: editing, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListJobListingsQueryKey() }); setEditing(null); },
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠어요?")) return;
    deleteJob.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListJobListingsQueryKey() }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">DB 직무 {jobs.length}개</p>
        <Button size="sm" className="rounded-full" onClick={startNew}><Plus size={14} className="mr-1" />직무 추가</Button>
      </div>

      {editing !== null && (
        <div className="rounded-3xl bg-card border-2 border-primary/30 p-5 space-y-4">
          <h3 className="font-extrabold text-lg">{editing === "new" ? "새 직무 추가" : "직무 수정"}</h3>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">카테고리</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${form.category === c ? "bg-primary/20 border-primary/50" : "bg-card border-border"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">직무명</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 h-9 rounded-xl bg-background" />
          </div>
          <ImageUpload label="이미지 (선택)" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">짧은 설명</label>
            <Textarea value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} rows={2} className="mt-1 rounded-xl bg-background" />
          </div>
          <div className="border border-border rounded-2xl p-4 bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold">학습 목록</label>
              <button type="button"
                onClick={() => setForm((f) => ({ ...f, learning: [...f.learning, { title: "", content: "" }] }))}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/15 font-semibold hover:bg-primary/25 transition-colors">
                <Plus size={11} />항목 추가
              </button>
            </div>
            {form.learning.length === 0 && (
              <p className="text-xs text-muted-foreground italic">학습 항목이 없습니다. [항목 추가]를 눌러주세요.</p>
            )}
            <div className="space-y-3">
              {form.learning.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border p-3 bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "hsl(45 80% 88%)", color: "hsl(35 60% 25%)" }}>{idx + 1}</span>
                    <Input value={item.title}
                      onChange={(e) => setForm((f) => ({ ...f, learning: f.learning.map((it, i) => i === idx ? { ...it, title: e.target.value } : it) }))}
                      placeholder="학습 항목 제목" className="h-8 rounded-lg bg-background flex-1 text-sm" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, learning: f.learning.filter((_, i) => i !== idx) }))}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <RichTextArea
                    value={item.content}
                    onChange={(val) => setForm((f) => ({ ...f, learning: f.learning.map((it, i) => i === idx ? { ...it, content: val } : it) }))}
                    placeholder={"내용을 입력하세요.\n\n팁: 텍스트를 선택한 뒤 위 버튼을 클릭하면 서식이 적용돼요.\nB = 볼드, I = 기울임, H2/H3 = 제목, • 목록 = 리스트"}
                    rows={6}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">순서</label>
              <Input type="number" min="1" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className="h-8 w-20 rounded-xl bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full" onClick={handleSave} disabled={!form.title}>저장</Button>
            <Button size="sm" variant="outline" className="rounded-full bg-card" onClick={() => setEditing(null)}>취소</Button>
          </div>
        </div>
      )}

      {isLoading ? <div className="py-8 text-center text-muted-foreground">불러오는 중...</div> : (
        jobs.length === 0
          ? <div className="rounded-3xl bg-card border border-card-border p-8 text-center text-muted-foreground">아직 직무가 없어요. 추가해보세요.</div>
          : <ul className="space-y-3">
            {jobs.map((j: JobListing) => (
              <li key={j.id} className="rounded-2xl bg-card border border-card-border px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 font-medium" style={{ color: "hsl(35 60% 25%)" }}>{j.category}</span>
                  <p className="mt-1 font-extrabold">{j.title}</p>
                  {j.shortDescription && <p className="text-xs text-muted-foreground mt-0.5">{j.shortDescription}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{j.isActive ? "활성" : "비활성"} · 순서 {j.displayOrder}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 rounded-full bg-card" onClick={() => startEdit(j)}><Pencil size={13} /></Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-full bg-card text-destructive" onClick={() => handleDelete(j.id)}><Trash2 size={13} /></Button>
                </div>
              </li>
            ))}
          </ul>
      )}
    </div>
  );
}

// ── Tab: 창업 아이디어 ──────────────────────────────────────

function StartupTab({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const { data: apps = [], isLoading } = useListStartupApplications<StartupApplication[]>({ request: ro });
  const setResult = useUpdateStartupApplicationResult({ request: ro });

  const [expanded, setExpanded] = useState<number | null>(null);
  const [resultForm, setResultForm] = useState<{ [id: number]: { result: string; reason: string } }>({});

  function getForm(id: number, app: StartupApplication) {
    return resultForm[id] ?? { result: app.result ?? "", reason: app.resultReason ?? "" };
  }

  function handleSaveResult(id: number) {
    const f = resultForm[id];
    if (!f?.result) return;
    setResult.mutate(
      { id, data: { result: f.result as "도전가능" | "도전불가능", resultReason: f.reason } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListStartupApplicationsQueryKey() }) },
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">전체 {apps.length}건</p>
      </div>
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">불러오는 중...</div>
      ) : apps.length === 0 ? (
        <div className="rounded-3xl bg-card border border-card-border p-10 text-center">
          <Mascot size={80} animate="bob" />
          <p className="mt-4 font-semibold">아직 신청이 없어요</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {apps.map((app: StartupApplication) => {
            const f = getForm(app.id, app);
            const isOpen = expanded === app.id;
            return (
              <li key={app.id} className="rounded-3xl bg-card border border-card-border overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : app.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-primary/5 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-base">{app.founderName}</span>
                      {app.result === "도전가능" && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">도전가능</span>}
                      {app.result === "도전불가능" && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">도전불가능</span>}
                      {!app.result && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">검토중</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(app.createdAt)} · {app.email}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-border/60 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-xs text-muted-foreground">창업상황</span><p className="font-medium">{app.registrationStatus}</p></div>
                      <div><span className="text-xs text-muted-foreground">준비도</span><p className="font-medium">{app.readiness}</p></div>
                      {app.readinessDetail && <div className="sm:col-span-2"><span className="text-xs text-muted-foreground">준비도 상세</span><p className="font-medium">{app.readinessDetail}</p></div>}
                      <div className="sm:col-span-2"><span className="text-xs text-muted-foreground">창업 아이템</span><p className="font-medium whitespace-pre-wrap">{app.startupIdea}</p></div>
                      <div className="sm:col-span-2"><span className="text-xs text-muted-foreground">아이템 이유</span><p className="font-medium whitespace-pre-wrap">{app.ideaReason}</p></div>
                      <div><span className="text-xs text-muted-foreground">경력/이력</span><p className="font-medium whitespace-pre-wrap">{app.experience}</p></div>
                      <div><span className="text-xs text-muted-foreground">팀/기관</span><p className="font-medium whitespace-pre-wrap">{app.team}</p></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">도전 결과 설정</p>
                      <div className="flex gap-2 mb-3">
                        {(["도전가능", "도전불가능"] as const).map((r) => (
                          <button key={r} type="button"
                            onClick={() => setResultForm((prev) => ({ ...prev, [app.id]: { ...getForm(app.id, app), result: r } }))}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${f.result === r ? (r === "도전가능" ? "bg-green-100 border-green-400 text-green-800" : "bg-red-100 border-red-400 text-red-800") : "bg-card border-border text-muted-foreground"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                      {f.result === "도전불가능" && (
                        <div className="mb-3">
                          <label className="text-xs font-semibold">불가 사유</label>
                          <Textarea value={f.reason}
                            onChange={(e) => setResultForm((prev) => ({ ...prev, [app.id]: { ...getForm(app.id, app), reason: e.target.value } }))}
                            placeholder="불가 사유를 작성해주세요." rows={3} className="mt-1 rounded-xl bg-background" />
                        </div>
                      )}
                      <Button size="sm" className="rounded-full" disabled={!f.result || setResult.isPending}
                        onClick={() => handleSaveResult(app.id)}>결과 저장</Button>
                      <div className="mt-2 flex items-center gap-2">
                        <Eye size={12} className="text-muted-foreground" />
                        <Link href={`/career-match/result/${app.id}`}>
                          <span className="text-xs text-muted-foreground underline">신청자 결과 페이지 보기</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// ── Tab: 창작 공간 ───────────────────────────────────────────

const MAX_EPISODE_IMAGES = 5;
const MAX_EPISODE_IMAGES_BYTES = 5 * 1024 * 1024;

function EpisodeManager({ work, password }: { work: CreativeWork; password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const { data: episodes = [], isLoading } = useListCreativeEpisodes(work.id);
  const createEp = useCreateCreativeEpisode({ request: ro });
  const updateEp = useUpdateCreativeEpisode({ request: ro });
  const deleteEp = useDeleteCreativeEpisode({ request: ro });

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ episodeNumber: "1", title: "", content: "", images: [] as string[], isActive: true });
  const [imgError, setImgError] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  function startNew() {
    const next = episodes.length > 0 ? Math.max(...episodes.map((e) => e.episodeNumber)) + 1 : 1;
    setForm({ episodeNumber: String(next), title: "", content: "", images: [], isActive: true });
    setImgError("");
    setEditing("new");
  }
  function startEdit(ep: CreativeEpisode) {
    setForm({
      episodeNumber: String(ep.episodeNumber), title: ep.title, content: ep.content,
      images: Array.isArray(ep.images) ? (ep.images as string[]) : [],
      isActive: ep.isActive,
    });
    setImgError("");
    setEditing(ep.id);
  }

  async function handleAddImages(files: FileList) {
    if (!files.length) return;
    const current = form.images;
    if (current.length + files.length > MAX_EPISODE_IMAGES) {
      setImgError(`이미지는 최대 ${MAX_EPISODE_IMAGES}장까지 추가할 수 있어요.`);
      return;
    }
    const newOnes: string[] = [];
    let totalBytes = current.reduce((s, b64) => s + Math.round((b64.length * 3) / 4), 0);
    for (const file of Array.from(files)) {
      if (totalBytes + file.size > MAX_EPISODE_IMAGES_BYTES) {
        setImgError("이미지 총 용량이 5MB를 초과했습니다.");
        return;
      }
      totalBytes += file.size;
      newOnes.push(await fileToBase64(file));
    }
    setImgError("");
    setForm((f) => ({ ...f, images: [...f.images, ...newOnes] }));
  }

  function handleSave() {
    const payload = {
      episodeNumber: Number(form.episodeNumber), title: form.title,
      content: form.content, images: form.images, isActive: form.isActive,
    };
    if (editing === "new") {
      createEp.mutate({ workId: work.id, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCreativeEpisodesQueryKey(work.id) }); setEditing(null); },
      });
    } else if (typeof editing === "number") {
      updateEp.mutate({ id: editing, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCreativeEpisodesQueryKey(work.id) }); setEditing(null); },
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("에피소드를 삭제할까요?")) return;
    deleteEp.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCreativeEpisodesQueryKey(work.id) }),
    });
  }

  return (
    <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">화(에피소드) 목록</p>
        <Button size="sm" variant="outline" className="rounded-full bg-background h-7 text-xs" onClick={startNew}>
          <Plus size={12} className="mr-1" />추가
        </Button>
      </div>
      {editing !== null && (
        <div className="bg-background rounded-2xl border border-border p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-20">
              <label className="text-xs font-semibold">화 번호</label>
              <Input type="number" min="1" value={form.episodeNumber}
                onChange={(e) => setForm((f) => ({ ...f, episodeNumber: e.target.value }))}
                className="mt-1 h-9 rounded-xl bg-card" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold">제목</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 h-9 rounded-xl bg-card" placeholder="에피소드 제목" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">내용</label>
            <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8} className="mt-1 rounded-xl bg-card font-mono text-sm" placeholder="본문 내용을 입력하세요..." />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold">이미지 ({form.images.length}/{MAX_EPISODE_IMAGES}장, 총 5MB 이하)</label>
              {form.images.length < MAX_EPISODE_IMAGES && (
                <button type="button" onClick={() => imgRef.current?.click()}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-1">
                  <ImageIcon size={11} />이미지 추가
                </button>
              )}
            </div>
            <input ref={imgRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files) handleAddImages(e.target.files); e.target.value = ""; }} />
            {imgError && <p className="text-xs text-destructive mb-2">{imgError}</p>}
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={`이미지 ${i + 1}`} className="size-20 rounded-xl object-cover border border-border" />
                    <button type="button"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 rounded-full text-xs" onClick={handleSave} disabled={!form.title}>저장</Button>
            <Button size="sm" variant="outline" className="h-7 rounded-full text-xs bg-card" onClick={() => setEditing(null)}>취소</Button>
          </div>
        </div>
      )}
      {isLoading ? <p className="text-xs text-muted-foreground">불러오는 중...</p> : (
        <ul className="space-y-2">
          {episodes.map((ep) => (
            <li key={ep.id} className="flex items-center justify-between gap-2 bg-background rounded-xl border border-border px-4 py-2.5">
              <span className={`text-sm font-medium ${!ep.isActive ? "text-muted-foreground line-through" : ""}`}>
                <span className="font-bold text-primary mr-2">{ep.episodeNumber}화</span>{ep.title}
                {Array.isArray(ep.images) && ep.images.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">[이미지 {ep.images.length}장]</span>
                )}
              </span>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" className="h-7 rounded-full bg-card" onClick={() => startEdit(ep)}><Pencil size={12} /></Button>
                <Button size="sm" variant="outline" className="h-7 rounded-full bg-card text-destructive" onClick={() => handleDelete(ep.id)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreativeTab({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const { data: works = [], isLoading } = useListCreativeWorks();
  const createWork = useCreateCreativeWork({ request: ro });
  const updateWork = useUpdateCreativeWork({ request: ro });
  const deleteWork = useDeleteCreativeWork({ request: ro });

  const { data: submissions = [] } = useListCreativeWorkSubmissions({ request: ro });
  const updateSubmission = useUpdateCreativeWorkSubmissionStatus({ request: ro });

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [expandedEpisodes, setExpandedEpisodes] = useState<number | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [form, setForm] = useState({ category: "소설", title: "", authorName: "", thumbnailUrl: "", displayOrder: "0", isActive: true });
  const thumbRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = ["소설", "만화", "에세이", "여행기", "시", "기타"];

  function startNew() { setForm({ category: "소설", title: "", authorName: "", thumbnailUrl: "", displayOrder: "0", isActive: true }); setEditing("new"); }
  function startEdit(w: CreativeWork) {
    setForm({ category: w.category, title: w.title, authorName: w.authorName ?? "", thumbnailUrl: w.thumbnailUrl ?? "", displayOrder: String(w.displayOrder), isActive: w.isActive });
    setEditing(w.id);
  }

  function handleSave() {
    const payload = {
      category: form.category, title: form.title, authorName: form.authorName,
      thumbnailUrl: form.thumbnailUrl || null,
      displayOrder: Number(form.displayOrder), isActive: form.isActive,
    };
    if (editing === "new") {
      createWork.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCreativeWorksQueryKey() }); setEditing(null); },
      });
    } else if (typeof editing === "number") {
      updateWork.mutate({ id: editing, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCreativeWorksQueryKey() }); setEditing(null); },
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("작품을 삭제하면 모든 에피소드도 삭제됩니다. 계속할까요?")) return;
    deleteWork.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCreativeWorksQueryKey() }),
    });
  }

  const newSubmissions = submissions.filter((s) => s.status === "new").length;

  return (
    <div className="space-y-4">
      {/* 신청함 토글 */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <button
          onClick={() => setShowSubmissions(!showSubmissions)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold hover:bg-primary/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Send size={14} />창작물 올리기 신청함
            {newSubmissions > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary" style={{ color: "hsl(35 60% 20%)" }}>{newSubmissions}건</span>
            )}
          </span>
          {showSubmissions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showSubmissions && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">아직 신청이 없어요.</p>
            ) : (
              <ul className="space-y-3">
                {submissions.map((s) => (
                  <li key={s.id} className={`rounded-xl border p-4 ${s.status === "new" ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-sm">{s.authorName}</p>
                        <p className="text-xs text-muted-foreground">{s.email} · {formatDate(s.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        {s.status === "new" && (
                          <Button size="sm" className="h-7 rounded-full text-xs"
                            onClick={() => updateSubmission.mutate({ id: s.id, data: { status: "read" } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCreativeWorkSubmissionsQueryKey() }) })}>
                            확인함
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{s.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">창작물 목록 ({works.length})</p>
        <Button size="sm" variant="outline" className="rounded-full bg-card h-8" onClick={startNew}>
          <Plus size={13} className="mr-1" />작품 추가
        </Button>
      </div>

      {editing !== null && (
        <div className="rounded-3xl bg-card border border-card-border p-5 space-y-4">
          <p className="font-bold text-sm">{editing === "new" ? "새 작품 추가" : "작품 수정"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">분류</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1.5 w-full h-9 px-3 rounded-xl border border-border bg-background text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">순서</label>
              <Input type="number" min="0" value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                className="mt-1.5 h-9 rounded-xl bg-background" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">제목</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1.5 h-9 rounded-xl bg-background" placeholder="작품 제목" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">작가명</label>
            <Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
              className="mt-1.5 h-9 rounded-xl bg-background" placeholder="작가명 또는 필명" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">썸네일 이미지</label>
            <div className="mt-1.5 flex items-center gap-3 flex-wrap">
              {form.thumbnailUrl && (
                <img src={form.thumbnailUrl} alt="썸네일"
                  className="size-16 rounded-xl object-cover border border-border bg-muted/40"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <button type="button" onClick={() => thumbRef.current?.click()}
                className="px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/40 transition-colors">
                <ImageIcon size={14} className="inline mr-1.5" />파일 선택
              </button>
              {form.thumbnailUrl && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, thumbnailUrl: "" }))}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors">제거</button>
              )}
              <input ref={thumbRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) fileToBase64(file).then((b64) => setForm((f) => ({ ...f, thumbnailUrl: b64 })));
                  e.target.value = "";
                }} />
            </div>
          </div>
          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
          </label>
          <div className="flex gap-2">
            <Button size="sm" className="h-8 rounded-full" onClick={handleSave} disabled={!form.title || !form.category}>저장</Button>
            <Button size="sm" variant="outline" className="h-8 rounded-full bg-background" onClick={() => setEditing(null)}>취소</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">불러오는 중...</div>
      ) : (
        <ul className="space-y-3">
          {works.map((w: CreativeWork) => (
            <li key={w.id} className="rounded-3xl bg-card border border-card-border p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {w.thumbnailUrl
                    ? <img src={w.thumbnailUrl} alt={w.title} className="size-12 rounded-xl object-cover border border-border" />
                    : <div className="size-12 rounded-xl bg-muted/40 flex items-center justify-center"><ImageIcon size={20} className="text-muted-foreground/40" /></div>
                  }
                  <div>
                    <p className="font-extrabold">{w.title}</p>
                    <p className="text-xs text-muted-foreground">
                      [{w.category}]{w.authorName ? ` · ${w.authorName}` : ""} · 순서 {w.displayOrder} · {w.isActive ? "활성" : "비활성"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full bg-card h-8"
                    onClick={() => setExpandedEpisodes(expandedEpisodes === w.id ? null : w.id)}>
                    {expandedEpisodes === w.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <span className="ml-1 text-xs">에피소드</span>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full bg-card h-8" onClick={() => startEdit(w)}><Pencil size={13} /></Button>
                  <Button size="sm" variant="outline" className="rounded-full bg-card h-8 text-destructive" onClick={() => handleDelete(w.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
              {expandedEpisodes === w.id && (
                <EpisodeManager work={w} password={password} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Tab: 인문학 콘텐츠 ──────────────────────────────────────

const HUMANITIES_CATEGORIES = ["문학", "문화", "역사", "지리", "예술", "기타"];

function HumanitiesTab({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const ro = useMemo(() => ({ headers: { "x-admin-password": password } }), [password]);

  const [subTab, setSubTab] = useState<"quiz" | "articles">("quiz");

  // Quiz
  const { data: quizzes = [], isLoading: quizzesLoading } = useListHumanitiesQuizzes({ request: ro });
  const createQuiz = useCreateHumanitiesQuiz({ request: ro });
  const updateQuiz = useUpdateHumanitiesQuiz({ request: ro });
  const deleteQuiz = useDeleteHumanitiesQuiz({ request: ro });

  const [quizEditing, setQuizEditing] = useState<number | "new" | null>(null);
  const [quizForm, setQuizForm] = useState({ question: "", answer: true, explanation: "", scheduledDate: "", isActive: true });

  function startNewQuiz() { setQuizForm({ question: "", answer: true, explanation: "", scheduledDate: "", isActive: true }); setQuizEditing("new"); }
  function startEditQuiz(q: (typeof quizzes)[0]) {
    setQuizForm({ question: q.question, answer: q.answer, explanation: q.explanation, scheduledDate: q.scheduledDate ?? "", isActive: q.isActive });
    setQuizEditing(q.id);
  }
  function handleSaveQuiz() {
    const payload = { question: quizForm.question, answer: quizForm.answer, explanation: quizForm.explanation, scheduledDate: quizForm.scheduledDate || null, isActive: quizForm.isActive };
    if (quizEditing === "new") {
      createQuiz.mutate({ data: payload }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListHumanitiesQuizzesQueryKey() }); setQuizEditing(null); } });
    } else if (typeof quizEditing === "number") {
      updateQuiz.mutate({ id: quizEditing, data: payload }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListHumanitiesQuizzesQueryKey() }); setQuizEditing(null); } });
    }
  }
  function handleDeleteQuiz(id: number) {
    if (!confirm("퀴즈를 삭제할까요?")) return;
    deleteQuiz.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListHumanitiesQuizzesQueryKey() }) });
  }

  // Articles
  const { data: articles = [], isLoading: articlesLoading } = useListHumanitiesArticles();
  const createArticle = useCreateHumanitiesArticle({ request: ro });
  const updateArticle = useUpdateHumanitiesArticle({ request: ro });
  const deleteArticle = useDeleteHumanitiesArticle({ request: ro });

  const [articleEditing, setArticleEditing] = useState<number | "new" | null>(null);
  const [articleForm, setArticleForm] = useState({ category: "문학", title: "", content: "", authorName: "", imageUrl: "", isActive: true, displayOrder: "0" });

  function startNewArticle() { setArticleForm({ category: "문학", title: "", content: "", authorName: "", imageUrl: "", isActive: true, displayOrder: "0" }); setArticleEditing("new"); }
  function startEditArticle(a: (typeof articles)[0]) {
    setArticleForm({ category: a.category, title: a.title, content: a.content, authorName: a.authorName, imageUrl: a.imageUrl, isActive: a.isActive, displayOrder: String(a.displayOrder) });
    setArticleEditing(a.id);
  }
  function handleSaveArticle() {
    const payload = { category: articleForm.category, title: articleForm.title, content: articleForm.content, authorName: articleForm.authorName, imageUrl: articleForm.imageUrl, isActive: articleForm.isActive, displayOrder: Number(articleForm.displayOrder) };
    if (articleEditing === "new") {
      createArticle.mutate({ data: payload }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListHumanitiesArticlesQueryKey() }); setArticleEditing(null); } });
    } else if (typeof articleEditing === "number") {
      updateArticle.mutate({ id: articleEditing, data: payload }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListHumanitiesArticlesQueryKey() }); setArticleEditing(null); } });
    }
  }
  function handleDeleteArticle(id: number) {
    if (!confirm("아티클을 삭제할까요?")) return;
    deleteArticle.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListHumanitiesArticlesQueryKey() }) });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setSubTab("quiz")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${subTab === "quiz" ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border"}`}>
          <HelpCircle size={13} />O/X 퀴즈 관리
        </button>
        <button onClick={() => setSubTab("articles")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${subTab === "articles" ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border"}`}>
          <FileText size={13} />아티클 관리
        </button>
      </div>

      {subTab === "quiz" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">퀴즈 목록 ({quizzes.length})</p>
            <Button size="sm" variant="outline" className="rounded-full bg-card h-8" onClick={startNewQuiz}>
              <Plus size={13} className="mr-1" />퀴즈 추가
            </Button>
          </div>

          {quizEditing !== null && (
            <div className="rounded-3xl bg-card border border-card-border p-5 space-y-4">
              <p className="font-bold text-sm">{quizEditing === "new" ? "새 퀴즈 추가" : "퀴즈 수정"}</p>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">질문</label>
                <Textarea value={quizForm.question} onChange={(e) => setQuizForm((f) => ({ ...f, question: e.target.value }))}
                  rows={3} className="mt-1.5 rounded-xl bg-background" placeholder="O/X 퀴즈 질문을 입력하세요" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">정답</label>
                <div className="mt-1.5 flex gap-3">
                  {[true, false].map((v) => (
                    <button key={String(v)} type="button" onClick={() => setQuizForm((f) => ({ ...f, answer: v }))}
                      className={`px-6 py-2 rounded-xl text-xl font-extrabold border-2 transition-colors ${quizForm.answer === v ? "border-primary bg-primary/20" : "border-border bg-background"}`}>
                      {v ? "O" : "X"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">해설</label>
                <Textarea value={quizForm.explanation} onChange={(e) => setQuizForm((f) => ({ ...f, explanation: e.target.value }))}
                  rows={3} className="mt-1.5 rounded-xl bg-background" placeholder="정/오답 해설" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">출제 날짜 (YYYY-MM-DD)</label>
                <Input type="date" value={quizForm.scheduledDate} onChange={(e) => setQuizForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  className="mt-1.5 h-9 rounded-xl bg-background" />
              </div>
              <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={quizForm.isActive} onChange={(e) => setQuizForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
              </label>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 rounded-full" onClick={handleSaveQuiz} disabled={!quizForm.question}>저장</Button>
                <Button size="sm" variant="outline" className="h-8 rounded-full bg-background" onClick={() => setQuizEditing(null)}>취소</Button>
              </div>
            </div>
          )}

          {quizzesLoading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : (
            <ul className="space-y-3">
              {quizzes.map((q) => (
                <li key={q.id} className="rounded-2xl bg-card border border-card-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-base font-extrabold ${q.answer ? "text-blue-600" : "text-red-600"}`}>{q.answer ? "O" : "X"}</span>
                        {q.scheduledDate && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 font-medium" style={{ color: "hsl(35 60% 25%)" }}>{q.scheduledDate}</span>
                        )}
                        {!q.isActive && <span className="text-xs text-muted-foreground">(비활성)</span>}
                      </div>
                      <p className="text-sm font-medium leading-snug">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">참여 {q.participantCount}명 · 정답률 {q.correctRate}%</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 rounded-full bg-card" onClick={() => startEditQuiz(q)}><Pencil size={12} /></Button>
                      <Button size="sm" variant="outline" className="h-7 rounded-full bg-card text-destructive" onClick={() => handleDeleteQuiz(q.id)}><Trash2 size={12} /></Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {subTab === "articles" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">아티클 목록 ({articles.length})</p>
            <Button size="sm" variant="outline" className="rounded-full bg-card h-8" onClick={startNewArticle}>
              <Plus size={13} className="mr-1" />아티클 추가
            </Button>
          </div>

          {articleEditing !== null && (
            <div className="rounded-3xl bg-card border border-card-border p-5 space-y-4">
              <p className="font-bold text-sm">{articleEditing === "new" ? "새 아티클 추가" : "아티클 수정"}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">분야</label>
                  <select value={articleForm.category} onChange={(e) => setArticleForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1.5 w-full h-9 px-3 rounded-xl border border-border bg-background text-sm">
                    {HUMANITIES_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">순서</label>
                  <Input type="number" min="0" value={articleForm.displayOrder} onChange={(e) => setArticleForm((f) => ({ ...f, displayOrder: e.target.value }))} className="mt-1.5 h-9 rounded-xl bg-background" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">제목 *</label>
                <Input value={articleForm.title} onChange={(e) => setArticleForm((f) => ({ ...f, title: e.target.value }))} className="mt-1.5 h-9 rounded-xl bg-background" placeholder="아티클 제목" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">글쓴이</label>
                <Input value={articleForm.authorName} onChange={(e) => setArticleForm((f) => ({ ...f, authorName: e.target.value }))} className="mt-1.5 h-9 rounded-xl bg-background" placeholder="글쓴이 이름" />
              </div>
              <ImageUpload
                label="대표 이미지 * (목록 원형 썸네일 + 글 상단)"
                value={articleForm.imageUrl}
                onChange={(url) => setArticleForm((f) => ({ ...f, imageUrl: url }))}
              />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">본문</label>
                <Textarea value={articleForm.content} onChange={(e) => setArticleForm((f) => ({ ...f, content: e.target.value }))} rows={10} className="mt-1.5 rounded-xl bg-background font-mono text-sm" placeholder="아티클 본문을 입력하세요..." />
              </div>
              <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={articleForm.isActive} onChange={(e) => setArticleForm((f) => ({ ...f, isActive: e.target.checked }))} />활성
              </label>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 rounded-full" onClick={handleSaveArticle} disabled={!articleForm.title || !articleForm.category}>저장</Button>
                <Button size="sm" variant="outline" className="h-8 rounded-full bg-background" onClick={() => setArticleEditing(null)}>취소</Button>
              </div>
            </div>
          )}

          {articlesLoading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : (
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id} className="rounded-2xl bg-card border border-card-border px-4 py-3 flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden border border-border bg-muted/30 shrink-0">
                    {a.imageUrl
                      ? <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-muted-foreground/40" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">[{a.category}] · {a.authorName} · {a.isActive ? "활성" : "비활성"}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 rounded-full bg-card" onClick={() => startEditArticle(a)}><Pencil size={12} /></Button>
                    <Button size="sm" variant="outline" className="h-7 rounded-full bg-card text-destructive" onClick={() => handleDeleteArticle(a.id)}><Trash2 size={12} /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab: 회원 현황 ───────────────────────────────────────────

interface SupabaseUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

function UserLikedJobs({ userId, allJobs }: { userId: string; allJobs: JobListing[] }) {
  const [likedJobIds, setLikedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    supabase
      .from("job_likes")
      .select("job_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        setLikedJobIds(data ? data.map((d: { job_id: string }) => d.job_id) : []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="text-xs text-muted-foreground">불러오는 중…</p>;
  if (likedJobIds.length === 0) return <p className="text-xs text-muted-foreground">관심 직무 없음</p>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {likedJobIds.map(id => {
        const job = allJobs.find(j => String(j.id) === id);
        return (
          <span key={id} className="inline-flex items-center gap-1 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg px-2 py-0.5">
            <Heart size={10} className="fill-red-400" />
            {job ? job.title : `직무 #${id}`}
          </span>
        );
      })}
    </div>
  );
}

function UsersTab({ password }: { password: string }) {
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const { data: allJobs = [] } = useListJobListings<JobListing[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { headers: { "x-admin-password": password } });
      if (!res.ok) throw new Error("회원 목록을 불러오지 못했습니다.");
      const data = await res.json() as SupabaseUser[];
      setUsers(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newPw) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ email: newEmail, password: newPw }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "계정 생성 실패");
      setNewEmail("");
      setNewPw("");
      await fetchUsers();
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("삭제 실패");
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 새 계정 만들기 */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <UserCheck size={15} className="text-primary" />새 계정 만들기
        </h3>
        <div className="flex gap-2 flex-wrap">
          <input
            type="email"
            placeholder="이메일"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="border border-border rounded-xl px-3 py-2 text-sm bg-background flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="text"
            placeholder="비밀번호"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="border border-border rounded-xl px-3 py-2 text-sm bg-background flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newEmail || !newPw}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {creating ? "생성 중…" : "생성"}
          </button>
        </div>
        {createError && <p className="mt-2 text-xs text-destructive">{createError}</p>}
      </div>

      {/* 회원 목록 */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Users size={15} className="text-primary" />
            전체 회원 <span className="text-muted-foreground font-normal">({users.length}명)</span>
          </h3>
          <button onClick={fetchUsers} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading && (
          <div className="p-8 text-center text-sm text-muted-foreground">불러오는 중…</div>
        )}
        {error && (
          <div className="p-8 text-center text-sm text-destructive">{error}</div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">회원이 없습니다.</div>
        )}

        {!loading && users.map((u, i) => (
          <div key={u.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background/50" : ""}`}>
            <button
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-primary/5 transition-colors"
              onClick={() => setExpanded(expanded === u.id ? null : u.id)}
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {(u.email ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.email ?? "(이메일 없음)"}</p>
                  <p className="text-xs text-muted-foreground">가입: {formatDate(u.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {u.email_confirmed_at
                  ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">이메일 인증됨</span>
                  : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">미인증</span>
                }
                {expanded === u.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </div>
            </button>

            {expanded === u.id && (
              <div className="px-5 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-muted/30 rounded-xl p-4">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-foreground break-all">{u.id}</span>
                  <span className="text-muted-foreground">마지막 로그인</span>
                  <span className="text-foreground">{u.last_sign_in_at ? formatDate(u.last_sign_in_at) : "—"}</span>
                  <span className="text-muted-foreground">이메일 인증</span>
                  <span className="text-foreground">{u.email_confirmed_at ? formatDate(u.email_confirmed_at) : "미인증"}</span>
                  {u.user_metadata && Object.keys(u.user_metadata).length > 0 && (
                    <>
                      <span className="text-muted-foreground col-span-2 mt-1 font-semibold">추가 정보 (user_metadata)</span>
                      {Object.entries(u.user_metadata).map(([k, v]) => (
                        <>
                          <span key={`k-${k}`} className="text-muted-foreground">{k}</span>
                          <span key={`v-${k}`} className="text-foreground break-all">{String(v)}</span>
                        </>
                      ))}
                    </>
                  )}
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Heart size={12} className="text-red-400" />관심 직무
                  </p>
                  <UserLikedJobs userId={u.id} allJobs={allJobs} />
                </div>
                <div className="flex justify-end">
                  {deleteConfirm === u.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive">정말 삭제할까요?</span>
                      <button onClick={() => handleDelete(u.id)} className="text-xs px-3 py-1.5 bg-destructive text-white rounded-lg font-semibold">삭제</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground">취소</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(u.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors border border-border hover:border-destructive/50 px-3 py-1.5 rounded-lg"
                    >
                      <UserX size={12} />계정 삭제
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Shell ─────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: "applications", label: "멘토링 신청함", icon: Inbox },
  { id: "mentors", label: "멘토 관리", icon: Users },
  { id: "jobs", label: "직무 학습", icon: Briefcase },
  { id: "startup", label: "창업 아이디어", icon: Rocket },
  { id: "creative", label: "창작 공간", icon: PenLine },
  { id: "humanities", label: "인문학 콘텐츠", icon: BookOpen },
  { id: "users", label: "회원 현황", icon: UserCheck },
];

function AdminShell({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("applications");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${tab === id ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover-elevate"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-card" onClick={onLogout}>
          <LogOut size={13} className="mr-1" />로그아웃
        </Button>
      </div>

      {tab === "applications" && <ApplicationsTab password={password} />}
      {tab === "mentors" && <MentorsTab password={password} />}
      {tab === "jobs" && <JobsTab password={password} />}
      {tab === "startup" && <StartupTab password={password} />}
      {tab === "creative" && <CreativeTab password={password} />}
      {tab === "humanities" && <HumanitiesTab password={password} />}
      {tab === "users" && <UsersTab password={password} />}
    </div>
  );
}

function PasswordPrompt({ onUnlock }: { onUnlock: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  return (
    <div className="mt-10 mx-auto max-w-sm rounded-3xl bg-card border border-card-border p-8 text-center">
      <div className="mx-auto size-14 rounded-2xl bg-primary/20 flex items-center justify-center">
        <Lock style={{ color: "hsl(35 60% 25%)" }} />
      </div>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight">관리자 로그인</h2>
      <p className="mt-1 text-sm text-muted-foreground">멘토링 신청 내역을 보려면 비밀번호를 입력하세요.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (pw.trim()) onUnlock(pw.trim()); }} className="mt-5 space-y-3 text-left">
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="관리자 비밀번호" className="h-11 rounded-xl bg-background" autoFocus />
        <Button type="submit" disabled={!pw.trim()} className="w-full h-11 rounded-xl font-bold">로그인</Button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setPassword(saved);
  }, []);

  function handleUnlock(pw: string) { window.localStorage.setItem(STORAGE_KEY, pw); setPassword(pw); }
  function handleLogout() { window.localStorage.removeItem(STORAGE_KEY); setPassword(null); }

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href="/">
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          홈으로
        </button>
      </Link>
      <div className="mt-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">관리자</h1>
        <p className="mt-1 text-sm text-muted-foreground">위미 플랫폼 관리 페이지입니다.</p>
      </div>
      {password
        ? <AdminShell password={password} onLogout={handleLogout} />
        : <PasswordPrompt onUnlock={handleUnlock} />}
    </div>
  );
}
