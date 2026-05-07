import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Inbox, Lock, Mail, CheckCircle2, Clock, LogOut, Users, Briefcase,
  Rocket, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Eye,
} from "lucide-react";
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

type Tab = "applications" | "mentors" | "jobs" | "startup";

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

  const applications = query.data ?? [];
  const newCount = applications.filter((a) => a.status === "new").length;

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

      {/* Form */}
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
              <ImageUpload
                label="프로필 사진 (선택)"
                value={form.photoUrl}
                onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))}
              />
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
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              활성
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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMentorQueryKey(mentorId) });
          setEditing(null);
        },
      });
    } else if (typeof editing === "number") {
      updateArticle.mutate({ id: editing, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMentorQueryKey(mentorId) });
          setEditing(null);
        },
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
          <ImageUpload
            label="이미지 (선택)"
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">짧은 설명</label>
            <Textarea value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} rows={2} className="mt-1 rounded-xl bg-background" />
          </div>

          {/* 학습 목록 편집 */}
          <div className="border border-border rounded-2xl p-4 bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold">학습 목록</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, learning: [...f.learning, { title: "", content: "" }] }))}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/15 font-semibold hover:bg-primary/25 transition-colors"
              >
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
                    <span
                      className="size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "hsl(45 80% 88%)", color: "hsl(35 60% 25%)" }}
                    >
                      {idx + 1}
                    </span>
                    <Input
                      value={item.title}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        learning: f.learning.map((it, i) => i === idx ? { ...it, title: e.target.value } : it),
                      }))}
                      placeholder="학습 항목 제목 (예: 국내 영업의 정의)"
                      className="h-8 rounded-lg bg-background flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, learning: f.learning.filter((_, i) => i !== idx) }))}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Textarea
                    value={item.content}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      learning: f.learning.map((it, i) => i === idx ? { ...it, content: e.target.value } : it),
                    }))}
                    placeholder="내용 (비워두면 '내용 추가 예정'으로 표시)"
                    rows={3}
                    className="rounded-lg bg-background text-sm"
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
          {apps.map((app: StartupApplication, i: number) => {
            const f = getForm(app.id, app);
            const isOpen = expanded === app.id;
            return (
              <li key={app.id} className="rounded-3xl bg-card border border-card-border overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : app.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-primary/5 transition-colors"
                >
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

                    {/* Result panel */}
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
                          <Textarea
                            value={f.reason}
                            onChange={(e) => setResultForm((prev) => ({ ...prev, [app.id]: { ...getForm(app.id, app), reason: e.target.value } }))}
                            placeholder="불가 사유를 작성해주세요."
                            rows={3}
                            className="mt-1 rounded-xl bg-background"
                          />
                        </div>
                      )}
                      <Button size="sm" className="rounded-full" disabled={!f.result || setResult.isPending}
                        onClick={() => handleSaveResult(app.id)}>
                        결과 저장
                      </Button>
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

// ── Admin Shell ─────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: "applications", label: "멘토링 신청함", icon: Inbox },
  { id: "mentors", label: "멘토 관리", icon: Users },
  { id: "jobs", label: "직무 학습", icon: Briefcase },
  { id: "startup", label: "창업 아이디어", icon: Rocket },
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
