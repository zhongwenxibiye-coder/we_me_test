import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, CheckCircle2 } from "lucide-react";
import { useCreateStartupApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REGISTRATION_OPTIONS = [
  "예비창업자(사업자등록을 하지 않은 상태)",
  "사업자등록 완료(개인사업자)",
  "사업자등록 완료(법인사업자)",
];

const READINESS_OPTIONS = [
  "아이디어만 있는 상태입니다",
  "시제품을 보여줄 수 있는 상태입니다",
  "제품이 완성된 상태이나, 아직 출시 전입니다",
  "제품이 완성되고, 현재 판매(출시) 중입니다",
];

function SelectGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="mt-2 flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors",
              value === opt
                ? "bg-primary/20 border-primary/50 text-foreground"
                : "bg-background border-border text-muted-foreground hover:bg-primary/5",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function StartupForm({ onClose }: { onClose: () => void }) {
  const [founderName, setFounderName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [startupIdea, setStartupIdea] = useState("");
  const [readiness, setReadiness] = useState("");
  const [readinessDetail, setReadinessDetail] = useState("");
  const [ideaReason, setIdeaReason] = useState("");
  const [experience, setExperience] = useState("");
  const [team, setTeam] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createApp = useCreateStartupApplication();

  const canSubmit =
    founderName.trim() &&
    email.trim() &&
    registrationStatus &&
    startupIdea.trim() &&
    readiness &&
    ideaReason.trim() &&
    experience.trim() &&
    team.trim() &&
    !createApp.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    createApp.mutate(
      {
        data: {
          founderName: founderName.trim(),
          email: email.trim(),
          registrationStatus,
          startupIdea: startupIdea.trim(),
          readiness,
          readinessDetail: readinessDetail.trim(),
          ideaReason: ideaReason.trim(),
          experience: experience.trim(),
          team: team.trim(),
        },
      },
      { onSuccess: () => setSubmitted(true) },
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 size={56} className="mx-auto" style={{ color: "hsl(88 55% 45%)" }} />
        <p className="mt-4 text-xl font-extrabold tracking-tight">도전하기가 신청되었습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          운영자 확인 후 가능여부 회신드리도록 하겠습니다.
        </p>
        <Button className="mt-6 rounded-full" onClick={onClose}>닫기</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">① 창업자(대표자 이름) <span className="text-rose-500">*</span></label>
          <Input
            value={founderName}
            onChange={(e) => setFounderName(e.target.value)}
            placeholder="홍길동"
            className="mt-1.5 h-11 rounded-xl bg-background"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">② 이메일 주소 <span className="text-rose-500">*</span></label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hong@example.com"
            className="mt-1.5 h-11 rounded-xl bg-background"
          />
        </div>
      </div>

      <SelectGroup
        label="③ 현재 창업 상황 *"
        options={REGISTRATION_OPTIONS}
        value={registrationStatus}
        onChange={setRegistrationStatus}
      />

      <div>
        <label className="text-sm font-semibold">④ 창업 아이템 소개 <span className="text-rose-500">*</span></label>
        <Textarea
          value={startupIdea}
          onChange={(e) => setStartupIdea(e.target.value)}
          placeholder="창업 아이템을 간략하게 소개해 주세요."
          rows={3}
          className="mt-1.5 rounded-xl bg-background"
        />
      </div>

      <div>
        <SelectGroup
          label="⑤ 현재 창업 준비 정도 *"
          options={READINESS_OPTIONS}
          value={readiness}
          onChange={setReadiness}
        />
        {readiness && (
          <div className="mt-3">
            <label className="text-sm font-semibold">선택 항목에 대한 구체적인 내용</label>
            <Textarea
              value={readinessDetail}
              onChange={(e) => setReadinessDetail(e.target.value)}
              placeholder="구체적인 내용을 자유롭게 적어주세요."
              rows={3}
              className="mt-1.5 rounded-xl bg-background"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold">⑥ 해당 창업 아이템을 생각하게 된 이유 <span className="text-rose-500">*</span></label>
        <Textarea
          value={ideaReason}
          onChange={(e) => setIdeaReason(e.target.value)}
          placeholder="아이템을 생각하게 된 배경이나 계기를 적어주세요."
          rows={3}
          className="mt-1.5 rounded-xl bg-background"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">⑦ 해당 창업 아이템과 관련된 보유 이력 및 경력 <span className="text-rose-500">*</span></label>
        <Textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="관련된 경험, 자격증, 수상 이력 등을 적어주세요."
          rows={3}
          className="mt-1.5 rounded-xl bg-background"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">⑧ 창업 아이템을 실현시킬 수 있는 팀원 또는 주변 기관 <span className="text-rose-500">*</span></label>
        <Textarea
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="함께하는 팀원이나 협력 기관을 소개해 주세요."
          rows={3}
          className="mt-1.5 rounded-xl bg-background"
        />
      </div>

      {createApp.isError && (
        <p className="text-sm font-medium" style={{ color: "hsl(0 70% 45%)" }}>
          신청 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-12 rounded-xl text-base font-bold"
      >
        {createApp.isPending ? "제출 중..." : "도전하기"}
      </Button>
    </form>
  );
}

export default function CareerMatchPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-8 border-b border-border/60"
      >
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
          Projects
        </p>
        <h1 className="mt-2 text-4xl lg:text-5xl font-extrabold tracking-tight">창업 프로젝트</h1>
        <p className="mt-3 text-muted-foreground">창업 프로젝트에 도전해 보세요.</p>
      </motion.div>
      {/* 아이디어 창업 도전하기 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-10"
      >
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-3xl border-2 border-primary/40 bg-card hover-elevate p-7 text-left group transition-all"
        >
          <div className="flex items-center gap-4">
            <div
              className="size-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "hsl(45 92% 55% / 0.18)" }}
            >
              <Rocket size={26} style={{ color: "hsl(35 60% 30%)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold tracking-tight">창업 멘토링 신청하기</h2>
              <p className="mt-1 text-sm text-muted-foreground font-medium">
                창업 정부지원금과 관련한 멘토링을 진행합니다
              </p>
            </div>
            <span
              className="text-sm font-semibold opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
              style={{ color: "hsl(35 60% 30%)" }}
            >
              신청하기 →
            </span>
          </div>
        </button>
      </motion.div>
      {/* 신청할 수 있는 프로젝트 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-extrabold tracking-tight">신청할 수 있는 프로젝트</h2>
        <p className="mt-1 text-sm text-muted-foreground">실제 기업이 요청한 프로젝트에 도전해보세요.</p>

        <div className="mt-6 rounded-3xl bg-card border border-card-border p-10 text-center">
          <Mascot size={96} animate="bob" />
          <p className="mt-4 font-semibold">현재 프로젝트가 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">곧 새로운 프로젝트가 업로드될 예정이에요.</p>
        </div>
      </motion.div>
      {/* 창업 신청 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">아이디어 창업 도전하기</DialogTitle>
          </DialogHeader>
          <StartupForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
