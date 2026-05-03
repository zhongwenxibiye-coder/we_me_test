import { useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, HelpCircle } from "lucide-react";
import { useCreateMentorApplication, useGetMentor } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Mascot } from "@/components/Mascot";

export default function MentorApply() {
  const [, params] = useRoute("/mentors/:id/apply");
  const id = params?.id ? parseInt(params.id, 10) : NaN;

  const { data: mentor, isLoading } = useGetMentor(isNaN(id) ? 0 : id);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createApplication = useCreateMentorApplication();

  const canSubmit =
    name.trim() &&
    contact.trim() &&
    topic.trim() &&
    message.trim().length >= 100 &&
    !createApplication.isPending;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 text-center">
        <Mascot size={120} animate="bob" />
        <p className="mt-4 font-semibold">멘토를 찾을 수 없어요</p>
        <Link href="/mentors">
          <Button className="mt-5 rounded-full">멘토 목록으로</Button>
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    createApplication.mutate(
      {
        data: {
          mentorId: String(mentor!.id),
          name: name.trim(),
          contact: contact.trim(),
          topic: topic.trim(),
          message: message.trim(),
        },
      },
      { onSuccess: () => setSubmitted(true) },
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href={`/mentors/${id}`}>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          {mentor.name} 멘토
        </button>
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">1:1 멘토링 신청</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mentor.name} 멘토에게 신청합니다. 간단한 정보를 남겨주시면 멘토가 직접 연락드려요.
        </p>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl bg-card border border-card-border p-8 text-center"
        >
          <CheckCircle2 size={56} className="mx-auto" style={{ color: "hsl(88 55% 45%)" }} />
          <p className="mt-4 text-xl font-extrabold tracking-tight">멘토링이 신청 되었습니다.</p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            곧 멘토가 확인 후 답변드리도록 하겠습니다.
          </p>
          <Link href="/mentors">
            <Button variant="outline" className="mt-6 rounded-full bg-card">멘토 목록으로</Button>
          </Link>
        </motion.div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-3xl bg-card border border-card-border p-6 lg:p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">이름</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="mt-1.5 h-11 rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">이메일</label>
              <Input
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="hong@example.com"
                className="mt-1.5 h-11 rounded-xl bg-background"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">상담 주제</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예) 인문계 진로 고민, 자기소개서 등"
              className="mt-1.5 h-11 rounded-xl bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">하고 싶은 이야기</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="고민하고 있는 내용을 편하게 적어주세요. (100자 이상)"
              rows={7}
              className="mt-1.5 rounded-xl bg-background"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className={`text-xs ${message.trim().length < 100 ? "text-muted-foreground" : "text-green-600"}`}>
                {message.trim().length} / 100자 이상
              </span>
            </div>
          </div>

          {createApplication.isError && (
            <p className="text-sm font-medium" style={{ color: "hsl(0 70% 45%)" }}>
              신청 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-12 rounded-xl text-base font-bold"
          >
            {createApplication.isPending ? "전송 중..." : "신청하기"}
          </Button>

          <div className="text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-default">
                  <HelpCircle size={12} />
                  메일로만 상담이 가능한가요?
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-center leading-relaxed" side="top">
                멘토링 상담은 메일로만 하고 있습니다. (전화, 화상, 대면 불가)<br />
                메일을 통해 고민을 작성해야지만 진정성 있고 더욱 깊이 있는 질문을 할 수 있습니다. 질문이 구체적일수록 답변 또한 구체적입니다.
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
      )}
    </div>
  );
}
