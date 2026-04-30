import { useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { useCreateMentorApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mascot } from "@/components/Mascot";
import { getMentorById } from "@/data/mentors";

export default function MentorDetail() {
  const [, params] = useRoute("/mentors/:id");
  const mentor = params?.id ? getMentorById(params.id) : undefined;

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
    message.trim().length >= 10 &&
    !createApplication.isPending;

  if (!mentor) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16 text-center">
        <Mascot size={120} animate="bob" />
        <p className="mt-4 font-semibold text-lg">멘토를 찾을 수 없어요</p>
        <Link href="/mentors">
          <Button className="mt-5 rounded-full">멘토 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !mentor) return;
    createApplication.mutate(
      {
        data: {
          mentorId: mentor.id,
          name: name.trim(),
          contact: contact.trim(),
          topic: topic.trim(),
          message: message.trim(),
        },
      },
      {
        onSuccess: () => setSubmitted(true),
      },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href="/mentors">
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          멘토 목록
        </button>
      </Link>

      {/* Profile */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-3xl bg-card border border-card-border p-6 lg:p-8"
      >
        <div className="flex items-start gap-5">
          <div
            className={`size-24 rounded-3xl ${mentor.avatarColor} flex items-center justify-center text-4xl font-extrabold shrink-0`}
            style={{ color: "hsl(30 50% 25%)" }}
          >
            {mentor.initial}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              {mentor.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap size={14} />
                {mentor.major}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                경력 {mentor.yearsOfExperience}년
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">멘토링 가능한 직무</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {mentor.mentoringFields.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/15 font-medium"
                    style={{ color: "hsl(35 60% 25%)" }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/60">
          <h2 className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
            소개
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">
            {mentor.bio}
          </p>
        </div>
      </motion.section>

      {/* Apply form */}
      <section id="apply" className="mt-10">
        <h2 className="text-2xl font-extrabold tracking-tight">멘토링 신청</h2>
        <p className="text-sm text-muted-foreground mt-1">
          간단한 정보를 남겨주시면 멘토가 직접 연락드려요.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl bg-card border border-card-border p-8 text-center"
          >
            <CheckCircle2
              size={56}
              className="mx-auto"
              style={{ color: "hsl(88 55% 45%)" }}
            />
            <p className="mt-4 text-xl font-extrabold tracking-tight">
              신청이 접수되었어요
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {mentor.name} 멘토가 곧 연락드릴 거예요.
              <br />
              조금만 기다려 주세요.
            </p>
            <Link href="/mentors">
              <Button variant="outline" className="mt-6 rounded-full bg-card">
                멘토 목록으로
              </Button>
            </Link>
          </motion.div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-5 rounded-3xl bg-card border border-card-border p-6 lg:p-8 space-y-5"
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
                <label className="text-sm font-semibold">연락처 (이메일·전화)</label>
                <Input
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
                placeholder="고민하고 있는 내용을 편하게 적어주세요. (10자 이상)"
                rows={6}
                className="mt-1.5 rounded-xl bg-background"
              />
              <p className="mt-1 text-xs text-muted-foreground text-right">
                {message.trim().length}자
              </p>
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
          </form>
        )}
      </section>
    </div>
  );
}
