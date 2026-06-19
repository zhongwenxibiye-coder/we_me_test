import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, Users, Flame } from "lucide-react";
import {
  useGetTodayQuiz,
  useSubmitQuizAttempt,
  getGetTodayQuizQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const SESSION_KEY_STORAGE = "wemi-session-key";
const QUIZ_ATTEMPT_PREFIX = "wemi-quiz-attempt-";
const STREAK_KEY = "wemi-quiz-streak";

function getOrCreateSessionKey(): string {
  let key = localStorage.getItem(SESSION_KEY_STORAGE);
  if (!key) {
    key = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY_STORAGE, key);
  }
  return key;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

interface StreakData {
  count: number;
  lastDate: string;
}

function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakData;
  } catch {}
  return { count: 0, lastDate: "" };
}

function updateStreak(): StreakData {
  const today = getTodayDate();
  const current = getStreak();
  if (current.lastDate === today) return current;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const newCount = current.lastDate === yesterdayStr ? current.count + 1 : 1;
  const next = { count: newCount, lastDate: today };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}

const TOTAL_DAYS = 7;
const STAMP_EMOJI = ["🌽", "🌽", "🌽", "🌽", "🌽", "🌽", "🌟"];

function StreakBar({ streak }: { streak: StreakData }) {
  const today = getTodayDate();
  const displayCount = Math.min(streak.count, TOTAL_DAYS);

  return (
    <div className="mt-6 rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50/80 to-yellow-50/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-orange-500" />
        <span className="text-sm font-bold text-orange-700">연속 출석 스탬프</span>
        {streak.count > 0 && (
          <span className="ml-auto text-xs font-bold text-orange-600 bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-full">
            🔥 {streak.count}일 연속
          </span>
        )}
      </div>
      <div className="flex justify-between gap-1">
        {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
          const filled = i < displayCount;
          const isToday = filled && i === displayCount - 1 && streak.lastDate === today;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg transition-all duration-300 ${
                  isToday
                    ? "bg-orange-400 shadow-lg shadow-orange-200/80 ring-2 ring-orange-300 scale-110"
                    : filled
                    ? "bg-primary shadow-md"
                    : "bg-white border-2 border-dashed border-border/50"
                }`}
              >
                {filled ? STAMP_EMOJI[i] : ""}
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground leading-none">
                {i + 1}일
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        {streak.count === 0
          ? "오늘 퀴즈를 풀면 첫 번째 스탬프를 받아요! 🌽"
          : streak.count >= TOTAL_DAYS
          ? "🎉 일주일 개근 달성! 정말 대단해요!"
          : `${TOTAL_DAYS - streak.count}일 더 출석하면 일주일 개근!`}
      </p>
    </div>
  );
}

export function QuizSection() {
  const sessionKey = useMemo(() => getOrCreateSessionKey(), []);
  const queryClient = useQueryClient();
  const quizQuery = useGetTodayQuiz({ sessionKey });
  const submitAttempt = useSubmitQuizAttempt();

  const quiz = quizQuery.data?.quiz ?? null;
  const serverAttempt = quizQuery.data?.attempt ?? null;

  const [localAttempt, setLocalAttempt] = useState<{ isCorrect: boolean } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState<StreakData>(() => getStreak());

  useEffect(() => {
    if (quiz) {
      const stored = localStorage.getItem(QUIZ_ATTEMPT_PREFIX + quiz.id);
      if (stored) {
        setLocalAttempt(JSON.parse(stored) as { isCorrect: boolean });
        setSubmitted(true);
      }
    }
  }, [quiz?.id]);

  useEffect(() => {
    setStreak(getStreak());
  }, []);

  const attempt = serverAttempt ?? localAttempt;
  const alreadyAttempted = submitted || !!attempt;

  function handleAnswer(answer: boolean) {
    if (!quiz || alreadyAttempted) return;
    const isCorrect = answer === quiz.answer;
    const finalize = () => {
      const result = { isCorrect };
      localStorage.setItem(QUIZ_ATTEMPT_PREFIX + quiz.id, JSON.stringify(result));
      setLocalAttempt(result);
      setSubmitted(true);
      const newStreak = updateStreak();
      setStreak(newStreak);
      queryClient.invalidateQueries({ queryKey: getGetTodayQuizQueryKey({ sessionKey }) });
    };
    submitAttempt.mutate(
      { data: { quizId: quiz.id, sessionKey, isCorrect } },
      { onSuccess: finalize, onError: finalize },
    );
  }

  return (
    <section>
      <div className="bg-card rounded-3xl border border-border p-6 lg:p-10">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle size={18} style={{ color: "hsl(45 92% 38%)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            오늘의 인문학 O/X 퀴즈
          </p>
        </div>

        {quizQuery.isLoading ? (
          <p className="text-muted-foreground text-sm mt-4">불러오는 중...</p>
        ) : !quiz ? (
          <div className="mt-4 text-center py-8">
            <p className="text-lg font-bold">오늘의 퀴즈가 준비 중입니다.</p>
            <p className="text-sm text-muted-foreground mt-1">매일 자정에 새로운 퀴즈가 올라와요!</p>
          </div>
        ) : (
          <div>
            <h2 className="mt-3 text-xl lg:text-2xl font-extrabold tracking-tight leading-snug">
              {quiz.question}
            </h2>

            {!alreadyAttempted ? (
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={submitAttempt.isPending}
                  className="flex-1 max-w-[160px] py-5 rounded-2xl border-2 border-border bg-background text-5xl font-extrabold hover:border-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                >
                  O
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={submitAttempt.isPending}
                  className="flex-1 max-w-[160px] py-5 rounded-2xl border-2 border-border bg-background text-5xl font-extrabold hover:border-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                >
                  X
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                {attempt?.isCorrect ? (
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={22} className="text-green-600" />
                    <p className="font-extrabold text-lg text-green-700">정답입니다!</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={22} className="text-destructive" />
                    <p className="font-extrabold text-lg text-destructive">다음에 다시 도전해 보세요.</p>
                  </div>
                )}

                <div className="bg-muted/50 rounded-2xl p-4 border border-border">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">해설</p>
                  <p className="text-sm leading-relaxed">{quiz.explanation || "해설이 준비 중입니다."}</p>
                </div>

                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground">
                    정답: <span className="font-bold">{quiz.answer ? "O" : "X"}</span>
                  </p>
                  {quiz.participantCount > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users size={12} />
                      <span>
                        참여자 <span className="font-bold text-foreground">{quiz.participantCount}명</span> 중{" "}
                        <span className="font-bold text-foreground">{quiz.correctRate}%</span>가 정답
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        <StreakBar streak={streak} />
      </div>
    </section>
  );
}
