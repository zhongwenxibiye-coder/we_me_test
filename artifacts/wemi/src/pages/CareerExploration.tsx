import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, ShieldAlert, Send, AlertCircle, BookOpen, Compass } from "lucide-react";
import {
  useExploreCareer,
  useGetCareerExplorationUsage,
  type CareerExplorationMessage,
  type CareerExplorationResult,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CAREER_STORAGE_KEY, loadCareerSession } from "@/lib/careerExplorationSession";
import { useAuth } from "@/contexts/AuthContext";

const TOTAL = 5;
const MAX_LEN = 800;
const UNSURE = "잘 모르겠어요";

function errorMessage(err: unknown): string {
  const fallback = "응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.";
  if (err && typeof err === "object") {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const e = (data as { error?: unknown }).error;
      if (typeof e === "string" && e.trim()) return e;
    }
  }
  return fallback;
}

export default function CareerExploration() {
  const { user, loading } = useAuth();
  if (loading) return <div className="mx-auto max-w-4xl px-6 py-16 text-muted-foreground">회원 정보를 확인하는 중...</div>;
  if (!user) return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">AI 직무 탐색</h1>
      <div className="mt-6 rounded-3xl border bg-card p-7">
        <h2 className="text-xl font-bold">회원 전용 기능이에요</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">회원가입과 이메일 인증 후 로그인하면 AI와 대화하며 나에게 맞는 직무 3개를 탐색할 수 있어요.</p>
        <p className="mt-3 text-sm text-muted-foreground">무분별한 사용을 막기 위해 회원별 일일 이용 한도가 적용돼요.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/login?next=/career-exploration"><Button>로그인하고 시작하기</Button></Link>
          <Link href="/signup"><Button variant="outline">회원가입</Button></Link>
        </div>
      </div>
    </div>
  );
  return <MemberCareerExploration key={user.id} memberId={user.id} />;
}

function MemberCareerExploration({ memberId }: { memberId: string }) {
  const { session } = useAuth();
  const [initial] = useState(() => loadCareerSession(memberId));
  const [messages, setMessages] = useState<CareerExplorationMessage[]>(initial.messages);
  const [result, setResult] = useState<CareerExplorationResult | null>(initial.result);
  const [draft, setDraft] = useState("");
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const authorization = { Authorization: `Bearer ${session?.access_token ?? ""}` };
  const usage = useGetCareerExplorationUsage({
    request: { headers: authorization },
    query: { queryKey: ["career-ai-usage", memberId], staleTime: 0, refetchOnWindowFocus: true, retry: false },
  });
  const exhausted = !!usage.data && usage.data.used >= usage.data.dailyLimit;
  const continuingToday = !!result && result.explorationDay === usage.data?.resetDay && messages.length > 0;
  const budgetExhausted = usage.data?.serviceBudgetExhausted ?? false;
  const unavailable = usage.isLoading || usage.isError || budgetExhausted || (exhausted && !continuingToday);
  const cannotRestart = exhausted && result?.explorationDay === usage.data?.resetDay;
  const explore = useExploreCareer({
    request: { headers: authorization },
    mutation: { retry: false, onSettled: () => { void usage.refetch(); } },
  });
  const pending = explore.isPending;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storageKey = `${CAREER_STORAGE_KEY}:${memberId}`;
      if (messages.length === 0 && !result) sessionStorage.removeItem(storageKey);
      else sessionStorage.setItem(storageKey, JSON.stringify({ messages, result }));
    } catch {
      /* storage unavailable */
    }
  }, [messages, result, memberId]);

  const complete = result?.status === "complete";
  const started = messages.length > 0;
  const answered = complete ? TOTAL : Math.min(TOTAL, messages.filter((m) => m.role === "user").length);

  useEffect(() => {
    if (started && !complete) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending, started, complete]);

  const begin = async () => {
    if (pending || unavailable) return;
    setError(null);
    try {
      const res = await explore.mutateAsync({ data: { messages: [] } });
      if (res.status === "question" && res.question) {
        setMessages([{ role: "assistant", content: res.question }]);
        setResult(res);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setError("첫 질문을 받지 못했어요. 다시 시도해 주세요.");
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const send = async (text: string) => {
    const content = text.trim();
    const retryLastResponse = (exhausted || budgetExhausted) && !!error && content === lastAttempt;
    if (!content || content.length > MAX_LEN || pending || (unavailable && !retryLastResponse)) return;
    setError(null);
    setLastAttempt(content);
    const userMsg: CareerExplorationMessage = { role: "user", content };
    try {
      const res = await explore.mutateAsync({ data: { messages: [...messages, userMsg], explorationDay: result?.explorationDay } });
      if (res.status === "complete") {
        setMessages([...messages, userMsg]);
        setResult(res);
        if (content === draft.trim()) setDraft("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.question) {
        setMessages([...messages, userMsg, { role: "assistant", content: res.question }]);
        setResult(res);
        if (content === draft.trim()) setDraft("");
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setError("다음 질문을 받지 못했어요. 다시 시도해 주세요.");
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const restart = () => {
    if (cannotRestart) return;
    setMessages([]);
    setResult(null);
    setDraft("");
    setError(null);
    setAcknowledged(false);
    setConfirmRestart(false);
    explore.reset();
  };

  const requestRestart = () => {
    if (messages.some((m) => m.role === "user")) setConfirmRestart(true);
    else restart();
  };

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between gap-6 pb-7 border-b border-border/60"
      >
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
            Career Exploration
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">AI 직무 탐색</h1>
          <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
            전공 이름보다 당신이 좋아하는 일의 결을 먼저 봐요. 다섯 번의 대화로 위미 직무 학습 자료 중 가까운 세 가지를 찾아드려요.
          </p>
        </div>
        <Mascot size={80} animate="bob" className="hidden sm:block shrink-0" />
      </motion.header>
      <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm" aria-live="polite">
        <p className="font-semibold">회원당 하루 1회 탐색 · 서비스 전체 하루 AI 예산 $1</p>
        <p className="mt-1 text-muted-foreground">첫 답변을 보내면 오늘의 탐색이 시작돼요. 같은 탐색의 후속 질문과 결과 확인은 이어서 할 수 있어요. 한국 시간 자정에 초기화되며, 전체 예산이 부족하면 다음 AI 요청은 중단돼요.</p>
        {usage.data && <p className="mt-2 font-semibold">{continuingToday && exhausted && !complete ? "오늘의 탐색을 이어서 진행 중이에요." : `오늘 남은 새 탐색: ${Math.max(0, usage.data.dailyLimit - usage.data.used)}회 / ${usage.data.dailyLimit}회`}</p>}
        {exhausted && <p className="mt-2 text-muted-foreground">새로운 탐색은 내일 가능해요. 진행 중인 대화는 시작한 브라우저에서 이어가고, 기존 결과는 계속 볼 수 있어요.</p>}
        {budgetExhausted && <p className="mt-2 text-destructive">오늘의 서비스 전체 AI 예산이 소진됐어요. 내일 다시 이용해 주세요.</p>}
        {usage.isError && <div className="mt-2"><span role="alert">이용 한도를 확인하지 못했어요. </span><button type="button" className="underline" onClick={() => void usage.refetch()}>다시 확인하기</button></div>}
      </div>

      {started && (
        <div className="mt-6 flex items-center gap-4" data-testid="status-progress">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
              <span>{complete ? "탐색 완료" : "대화 진행"}</span>
              <span aria-live="polite">{answered} / {TOTAL} 답변</span>
            </div>
            <div
              className="flex gap-1.5"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={TOTAL}
              aria-valuenow={answered}
              aria-label="답변 진행률"
            >
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary origin-left"
                    initial={false}
                    animate={{ scaleX: i < answered ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={requestRestart}
            disabled={pending || cannotRestart}
            className="gap-1.5 text-muted-foreground shrink-0"
            data-testid="button-restart"
          >
            <RotateCcw size={14} />
            처음부터
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8 grid md:grid-cols-[1.1fr_1fr] gap-5"
          >
            <div className="rounded-3xl bg-card border border-card-border p-6 lg:p-8">
              <h2 className="text-xl font-extrabold tracking-tight">이렇게 진행돼요</h2>
              <ol className="mt-5 space-y-4">
                {[
                  ["다섯 개의 질문", "앞선 답변을 바탕으로 다음 질문이 조금씩 달라져요."],
                  ["솔직한 답이면 충분해요", `떠오르지 않으면 '${UNSURE}'라고 답해도 괜찮아요.`],
                  ["세 가지 직무 추천", "추천 이유, 다음 한 걸음, 위미 학습 자료로 바로 이어져요."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="h-8 w-8 shrink-0 rounded-full bg-primary/20 text-sm font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{t}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-border bg-accent/60 p-6 lg:p-8 flex flex-col">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert size={18} className="shrink-0" />
                시작하기 전에 꼭 읽어주세요
              </div>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-accent-foreground/90 list-disc pl-5" data-testid="text-notice">
                <li>입력한 답변은 추천 생성을 위해 외부 AI 서비스로 전송돼요.</li>
                <li>이름, 연락처, 학교·학번, 주소 같은 개인정보는 적지 마세요.</li>
                <li>입력한 답변 원문은 서버에 저장하지 않아요. 하루 1회 제한과 중복 과금 방지를 위해 요청 식별값·이용량 및 AI 응답을 서버에 보관하며, 지난 날짜의 AI 응답은 다음 서비스 이용 시 정리해요. 전체 대화는 이 브라우저 탭에 임시 보관돼요.</li>
                <li>외부 AI의 데이터 처리 정책은 별도로 적용돼요.</li>
                <li>검증된 적성검사가 아닌 탐색용 대화예요. 결과는 참고로만 봐주세요.</li>
              </ul>
              <label className="mt-6 flex items-start gap-3 cursor-pointer select-none rounded-2xl bg-background/70 border border-border p-4">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[hsl(45_92%_45%)]"
                  data-testid="checkbox-acknowledge"
                />
                <span className="text-sm font-medium">위 안내를 확인했고, 개인정보 없이 답변할게요.</span>
              </label>
              <Button
                onClick={() => void begin()}
                disabled={!acknowledged || pending || unavailable}
                className="mt-4 h-12 rounded-2xl text-base font-bold gap-2"
                data-testid="button-begin"
              >
                {pending ? "첫 질문을 준비하는 중..." : "탐색 시작하기"}
                {!pending && <ArrowRight size={16} />}
              </Button>
              {error && <ErrorBox message={error} onRetry={() => void begin()} pending={pending} />}
            </div>
          </motion.section>
        ) : complete && result ? (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <div className="rounded-3xl bg-card border border-card-border p-6 lg:p-8 flex gap-5 items-start">
              <Mascot size={56} className="shrink-0 hidden sm:block" />
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">대화 요약</p>
                <p className="mt-2 leading-relaxed" data-testid="text-summary">{result.summary}</p>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-extrabold tracking-tight">살펴볼 만한 세 가지 직무</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">각 직무는 위미 직무 학습 페이지와 연결돼 있어요. 돌아와도 결과는 이 탭에 남아 있어요.</p>

            <ol className="mt-5 space-y-4">
              {result.recommendations.map((rec, i) => (
                <motion.li
                  key={rec.jobId}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, duration: 0.3 }}
                  className="rounded-3xl bg-card border border-card-border p-6 lg:p-7 grid sm:grid-cols-[auto_1fr] gap-x-6 gap-y-4"
                  data-testid={`card-recommendation-${rec.jobId}`}
                >
                  <span className="text-4xl font-extrabold tracking-tight text-primary leading-none tabular-nums">
                    0{i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary/15" style={{ color: "hsl(88 45% 32%)" }}>
                      {rec.category}
                    </span>
                    <h3 className="mt-2 text-xl font-extrabold tracking-tight">{rec.title}</h3>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Compass size={13} />추천 이유</p>
                        <p className="mt-1.5 text-sm leading-relaxed">{rec.reason}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/50 p-4">
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><BookOpen size={13} />다음 한 걸음</p>
                        <p className="mt-1.5 text-sm leading-relaxed">{rec.nextStep}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">직무 학습 페이지에서 실무 내용과 학습 자료를 확인할 수 있어요.</p>
                      <Link
                        href={rec.href}
                        className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover-elevate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label={`${rec.title} 자세히 보기`}
                        data-testid={`link-recommendation-${rec.jobId}`}
                      >
                        자세히 보기
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>

            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
              이 결과는 짧은 대화를 바탕으로 한 탐색용 제안이며, 검증된 적성·진로 검사를 대신하지 않아요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" disabled={cannotRestart} onClick={requestRestart} className="gap-1.5 rounded-xl" data-testid="button-restart-result">
                <RotateCcw size={14} />
                {cannotRestart ? "새 탐색은 내일 가능해요" : "새로 탐색하기"}
              </Button>
              <Link href="/jobs" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-all-jobs">
                전체 직무 둘러보기
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-6"
          >
            <div className="rounded-3xl bg-card border border-card-border p-4 sm:p-6 space-y-4" aria-live="polite">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex gap-3", m.role === "user" && "justify-end")}
                >
                  {m.role === "assistant" && <Mascot size={34} className="shrink-0 mt-1" />}
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words",
                      m.role === "assistant" ? "bg-muted/70 rounded-tl-md" : "bg-primary/25 rounded-tr-md",
                    )}
                    data-testid={`text-message-${i}`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {pending && (
                <div className="flex gap-3" aria-label="다음 질문을 준비하는 중">
                  <Mascot size={34} animate="bob" className="shrink-0 mt-1" />
                  <div className="rounded-2xl rounded-tl-md bg-muted/70 px-4 py-3 space-y-2 w-56">
                    <div className="h-3 rounded-full bg-foreground/10 animate-pulse" />
                    <div className="h-3 w-2/3 rounded-full bg-foreground/10 animate-pulse" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); void send(draft); }}
              className="mt-4 rounded-3xl bg-card border border-card-border p-4 sm:p-5"
            >
              <label htmlFor="career-answer" className="text-sm font-bold">
                {answered + 1}번째 답변
              </label>
              <textarea
                id="career-answer"
                ref={inputRef}
                value={draft}
                maxLength={MAX_LEN}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(draft); }
                }}
                disabled={pending || unavailable}
                rows={4}
                placeholder="떠오르는 대로 편하게 적어주세요. 개인정보는 빼고요."
                aria-describedby="career-answer-hint"
                className="mt-2 w-full resize-y rounded-2xl border border-input bg-background px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                data-testid="input-answer"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground" id="career-answer-hint">
                <span className="hidden sm:inline">Ctrl/Cmd + Enter로 보내기</span>
                <span className={cn("ml-auto tabular-nums", draft.length > MAX_LEN * 0.9 && "text-destructive font-semibold")}>
                  {draft.length} / {MAX_LEN}
                </span>
              </div>
              {error && <ErrorBox message={error} onRetry={() => void send(lastAttempt ?? draft)} pending={pending} retryDisabled={usage.isLoading || usage.isError || !(lastAttempt ?? draft).trim()} />}
              <div className="mt-3 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending || unavailable}
                  onClick={() => void send(UNSURE)}
                  className="rounded-xl"
                  data-testid="button-unsure"
                >
                  {UNSURE}
                </Button>
                <Button
                  type="submit"
                  disabled={pending || unavailable || !draft.trim()}
                  className="rounded-xl gap-1.5 font-bold"
                  data-testid="button-send"
                >
                  {pending ? "보내는 중..." : "답변 보내기"}
                  {!pending && <Send size={14} />}
                </Button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <AlertDialog open={confirmRestart} onOpenChange={setConfirmRestart}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>처음부터 다시 시작할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              지금까지의 답변{complete ? "과 추천 결과" : ""}가 이 탭에서 사라지고 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-restart">계속하기</AlertDialogCancel>
            <AlertDialogAction onClick={restart} data-testid="button-confirm-restart">다시 시작</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ErrorBox({
  message,
  onRetry,
  pending,
  retryDisabled,
}: {
  message: string;
  onRetry: () => void;
  pending: boolean;
  retryDisabled?: boolean;
}) {
  return (
    <div role="alert" className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3.5 flex items-start gap-3" data-testid="status-error">
      <AlertCircle size={17} className="text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p>{message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">작성 중인 답변과 이전 대화는 그대로 남아 있어요.</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onRetry}
        disabled={pending || retryDisabled}
        className="shrink-0 rounded-xl gap-1"
        data-testid="button-retry"
      >
        <RotateCcw size={13} />
        다시 시도
      </Button>
    </div>
  );
}
