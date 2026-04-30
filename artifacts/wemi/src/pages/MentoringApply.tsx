import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mascot } from "@/components/Mascot";
import { PageHeader } from "@/components/PageHeader";
import { getMentorById } from "@/data/mentors";
import { useToast } from "@/hooks/use-toast";

const TOPICS = [
  "전공을 살린 진로 탐색",
  "직무 전환 고민",
  "포트폴리오 피드백",
  "자기소개서 첨삭",
  "면접 준비",
  "이직 준비",
  "기타 자유 주제",
];

const schema = z.object({
  topic: z.string().min(1, "멘토링 주제를 골라주세요."),
  preferredDate: z.string().min(1, "희망 일정을 입력해주세요."),
  message: z
    .string()
    .min(10, "멘토에게 하고 싶은 말을 10자 이상 적어주세요.")
    .max(500, "500자 이내로 적어주세요."),
  contact: z.string().min(4, "연락 받을 방법을 알려주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function MentoringApply() {
  const [, params] = useRoute("/mentors/:id/apply");
  const mentorId = params?.id;
  const mentor = mentorId ? getMentorById(mentorId) : undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { topic: "" },
  });

  const topic = watch("topic");

  if (!mentor) {
    return (
      <div>
        <PageHeader title="멘토링 신청" back="/mentors" />
        <div className="p-6 text-center">
          <Mascot size={84} animate="bob" />
          <p className="mt-4 font-semibold">멘토를 찾을 수 없어요</p>
          <Link href="/mentors">
            <Button className="mt-4 rounded-full">멘토 목록으로 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    try {
      const all = JSON.parse(localStorage.getItem("wemi.applications") || "[]");
      all.push({ ...values, mentorId: mentor.id, createdAt: new Date().toISOString() });
      localStorage.setItem("wemi.applications", JSON.stringify(all));
    } catch {
      // ignore
    }
    setSubmitted(true);
    toast({ title: "신청이 전달됐어요", description: `${mentor.name} 멘토에게 메시지를 보냈어요.` });
  };

  if (submitted) {
    return (
      <div>
        <PageHeader title="신청 완료" back="/mentors" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-10 pb-10 text-center"
        >
          <Mascot size={140} animate="float" />
          <CheckCircle2
            size={32}
            className="mx-auto mt-4"
            style={{ color: "hsl(88 45% 45%)" }}
          />
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
            잘 전달했어요!
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {mentor.name} 멘토님이 곧 답장을 드릴 거예요.
            <br />
            기다리는 동안 직무 콘텐츠도 둘러볼까요?
          </p>
          <div className="mt-7 flex flex-col gap-2.5">
            <Link href="/jobs">
              <Button size="lg" className="w-full rounded-2xl h-12">
                직무 콘텐츠 보러 가기
              </Button>
            </Link>
            <Link href="/mentors">
              <Button size="lg" variant="ghost" className="w-full rounded-2xl h-12">
                다른 멘토도 둘러보기
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="멘토링 신청" back="/mentors" />

      <div className="px-5 pt-4 pb-10">
        {/* Mentor summary card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-4 flex gap-3 items-center"
          style={{
            background: "linear-gradient(135deg, hsl(45 80% 92%) 0%, hsl(48 70% 96%) 100%)",
          }}
        >
          <div
            className={`size-14 rounded-2xl ${mentor.avatarColor} flex items-center justify-center text-xl font-extrabold shrink-0`}
            style={{ color: "hsl(30 50% 25%)" }}
          >
            {mentor.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base">{mentor.name} 멘토</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {mentor.company} · {mentor.position} · {mentor.yearsOfExperience}년차
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Field label="멘토링 주제" error={errors.topic?.message}>
            <Select
              value={topic}
              onValueChange={(v) =>
                setValue("topic", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="어떤 이야기를 나누고 싶나요?" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="희망 일정"
            hint="가능한 요일이나 시간대를 자유롭게 적어주세요"
            error={errors.preferredDate?.message}
          >
            <Input
              placeholder="예) 평일 저녁 7시 이후, 주말 오전"
              className="h-12 rounded-2xl"
              {...register("preferredDate")}
            />
          </Field>

          <Field
            label="멘토에게 하고 싶은 말"
            hint="고민, 궁금한 점, 듣고 싶은 이야기를 솔직하게 적어주세요"
            error={errors.message?.message}
          >
            <Textarea
              rows={6}
              placeholder="예) 영문과 졸업을 앞두고 있는데, 마케팅 직무가 정말 저한테 맞을지 솔직한 이야기 듣고 싶어요."
              className="rounded-2xl resize-none"
              {...register("message")}
            />
          </Field>

          <Field
            label="연락 받을 방법"
            hint="이메일, 카카오톡 ID 등 편한 방법을 알려주세요"
            error={errors.contact?.message}
          >
            <Input
              placeholder="예) you@example.com 또는 카카오 ID"
              className="h-12 rounded-2xl"
              {...register("contact")}
            />
          </Field>

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/10 border border-secondary/20 mt-2"
            >
              <Mascot size={36} />
              <p className="text-xs text-foreground/80 leading-relaxed">
                긴장하지 않아도 돼요. 위미가 멘토님께 따뜻하게 전달할게요.
              </p>
            </motion.div>
          </AnimatePresence>

          <Button
            type="submit"
            size="lg"
            className="w-full h-13 rounded-2xl text-base font-semibold mt-3"
            onClick={() => {
              if (!topic) setValue("topic", "", { shouldValidate: true });
            }}
          >
            멘토에게 신청 보내기
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full h-12 rounded-2xl"
            onClick={() => setLocation("/mentors")}
          >
            취소
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
