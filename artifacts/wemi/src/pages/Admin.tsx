import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Inbox,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  LogOut,
} from "lucide-react";
import { Link } from "wouter";
import {
  useListMentorApplications,
  useUpdateMentorApplicationStatus,
  getListMentorApplicationsQueryKey,
  type MentorApplication,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/Mascot";
import { getMentorById } from "@/data/mentors";

const STORAGE_KEY = "wemi-admin-password";

function formatDate(value: string): string {
  const d = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function isContactEmail(contact: string): boolean {
  return /@/.test(contact);
}

function ApplicationsList({ password }: { password: string }) {
  const queryClient = useQueryClient();
  const requestOptions = useMemo(
    () => ({ headers: { "x-admin-password": password } }),
    [password],
  );

  const query = useListMentorApplications<MentorApplication[]>({
    request: requestOptions,
  });

  const updateStatus = useUpdateMentorApplicationStatus({
    request: requestOptions,
  });

  const applications = query.data ?? [];
  const newCount = applications.filter((a) => a.status === "new").length;

  if (query.isLoading) {
    return (
      <div className="mt-12 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mt-8 rounded-2xl bg-card border border-card-border p-6 text-center">
        <p className="font-semibold">신청 내역을 불러오지 못했어요.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          비밀번호가 올바른지 확인해 주세요.
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-full bg-card"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }}
        >
          <LogOut className="mr-1.5" size={14} /> 로그아웃
        </Button>
      </div>
    );
  }

  function handleToggleStatus(app: MentorApplication) {
    const next = app.status === "read" ? "new" : "read";
    updateStatus.mutate(
      { id: app.id, data: { status: next } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListMentorApplicationsQueryKey(),
          });
        },
      },
    );
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Inbox size={16} />
          <span>
            전체 {applications.length}건 · 새 신청{" "}
            <span className="font-bold text-foreground">{newCount}</span>건
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-card"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }}
        >
          <LogOut className="mr-1.5" size={14} /> 로그아웃
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-card border border-card-border p-10 text-center">
          <Mascot size={100} animate="bob" />
          <p className="mt-4 font-semibold">아직 신청이 없어요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            새 멘토링 신청이 들어오면 여기에 표시돼요.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {applications.map((app, i) => {
            const mentor = getMentorById(app.mentorId);
            const isNew = app.status === "new";
            return (
              <motion.li
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-3xl border p-5 lg:p-6 ${
                  isNew
                    ? "bg-card border-primary/40"
                    : "bg-card/60 border-card-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-extrabold tracking-tight">
                        {app.name}
                      </span>
                      {isNew ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary"
                          style={{ color: "hsl(35 60% 20%)" }}
                        >
                          새 신청
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                          확인함
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatDate(app.createdAt)}
                      </span>
                      <span>
                        멘토: {mentor?.name ?? app.mentorId}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isNew ? "default" : "outline"}
                    className={`rounded-full ${isNew ? "" : "bg-card"}`}
                    disabled={updateStatus.isPending}
                    onClick={() => handleToggleStatus(app)}
                  >
                    {isNew ? (
                      <>
                        <CheckCircle2 className="mr-1.5" size={14} /> 확인함으로
                      </>
                    ) : (
                      "다시 새로 표시"
                    )}
                  </Button>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    {isContactEmail(app.contact) ? (
                      <Mail
                        size={14}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                      />
                    ) : (
                      <Phone
                        size={14}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                      />
                    )}
                    <span className="font-medium break-all">{app.contact}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">상담 주제</span>
                    <p className="font-medium">{app.topic}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-xs text-muted-foreground">메시지</p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {app.message}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function PasswordPrompt({ onUnlock }: { onUnlock: (pw: string) => void }) {
  const [pw, setPw] = useState("");

  return (
    <div className="mt-10 mx-auto max-w-sm rounded-3xl bg-card border border-card-border p-8 text-center">
      <div className="mx-auto size-14 rounded-2xl bg-primary/20 flex items-center justify-center">
        <Lock style={{ color: "hsl(35 60% 25%)" }} />
      </div>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight">
        관리자 로그인
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        멘토링 신청 내역을 보려면 비밀번호를 입력하세요.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.trim()) onUnlock(pw.trim());
        }}
        className="mt-5 space-y-3 text-left"
      >
        <Input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="관리자 비밀번호"
          className="h-11 rounded-xl bg-background"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!pw.trim()}
          className="w-full h-11 rounded-xl font-bold"
        >
          로그인
        </Button>
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

  function handleUnlock(pw: string) {
    window.localStorage.setItem(STORAGE_KEY, pw);
    setPassword(pw);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href="/">
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          홈으로
        </button>
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
          멘토링 신청함
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          소소생 멘토에게 도착한 멘토링 신청 내역이에요.
        </p>
      </div>

      {password ? (
        <ApplicationsList password={password} />
      ) : (
        <PasswordPrompt onUnlock={handleUnlock} />
      )}
    </div>
  );
}
