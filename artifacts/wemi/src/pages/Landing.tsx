import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  MessageCircleHeart,
  Star,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { JOBS } from "@/data/jobs";
import { MENTORS } from "@/data/mentors";

const VALUES = [
  {
    icon: BookOpen,
    title: "인문계에 맞는 직무 탐색",
    desc: "전공을 살릴 수 있는 진짜 직무를, 친절한 설명과 함께 찾아드려요.",
  },
  {
    icon: Users,
    title: "걸어본 졸업생 멘토",
    desc: "같은 전공으로 같은 길을 먼저 걸어간 선배들이 기다리고 있어요.",
  },
  {
    icon: MessageCircleHeart,
    title: "1:1 따뜻한 멘토링",
    desc: "막막한 질문도 괜찮아요. 위미가 따뜻한 대화를 이어드려요.",
  },
];

export default function Landing() {
  const topJobs = JOBS.slice(0, 3);
  const topMentors = MENTORS.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(45 90% 80%) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute top-32 -left-40 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(88 60% 75%) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/15 text-xs font-medium border border-secondary/30">
              <Sparkles size={13} style={{ color: "hsl(88 45% 40%)" }} />
              <span style={{ color: "hsl(88 45% 32%)" }}>인문계 진로의 따뜻한 동행</span>
            </span>
            <h1 className="mt-5 text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
              인문계도
              <br />
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(135deg, hsl(45 95% 50%), hsl(35 90% 55%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                길은 있어요
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              막막한 진로 고민, 혼자 끙끙대지 마세요.
              <br />
              위미가 잘 어울리는 직무도, 같은 길을 걸어간 선배도 함께 찾아드릴게요.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/jobs">
                <Button size="lg" className="h-14 px-7 text-base font-semibold rounded-2xl shadow-md">
                  직무 둘러보기
                  <ArrowRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link href="/mentors">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-7 text-base font-semibold rounded-2xl bg-card"
                >
                  멘토 만나러 가기
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 max-w-md gap-3">
              <Stat value={`${JOBS.length}+`} label="추천 직무" />
              <Stat value={`${MENTORS.length}명`} label="졸업생 멘토" border />
              <Stat value="850+" label="누적 멘토링" />
            </div>
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 18 }}
            className="relative flex items-center justify-center min-h-[420px]"
          >
            <div
              className="absolute inset-0 mx-auto my-auto max-w-[420px] max-h-[420px] rounded-[36%] rotate-6"
              style={{ background: "linear-gradient(135deg, hsl(45 85% 88%) 0%, hsl(48 75% 95%) 100%)" }}
            />
            <div
              className="absolute inset-0 mx-auto my-auto max-w-[380px] max-h-[380px] rounded-[42%] -rotate-3"
              style={{ background: "linear-gradient(135deg, hsl(88 50% 85%) 0%, hsl(90 40% 92%) 100%)", opacity: 0.7 }}
            />
            <div className="relative">
              <Mascot size={340} animate="float" />
            </div>

            {/* floating cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-8 left-0 bg-card rounded-2xl shadow-lg border border-card-border px-3.5 py-2.5 flex items-center gap-2.5"
            >
              <div className="size-8 rounded-full bg-amber-200 flex items-center justify-center text-sm font-bold" style={{ color: "hsl(30 50% 25%)" }}>
                이
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">이서윤 멘토</p>
                <p className="text-[10px] text-muted-foreground">토스 · UX 라이터</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="absolute bottom-12 -right-2 bg-card rounded-2xl shadow-lg border border-card-border px-4 py-3"
            >
              <div className="flex items-center gap-1.5">
                <Star size={13} fill="hsl(45 92% 55%)" stroke="hsl(45 92% 55%)" />
                <p className="text-xs font-bold">콘텐츠 마케터</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">적합도 95점 · 인기</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-2 left-6 bg-card rounded-full shadow-md border border-card-border px-3.5 py-2 flex items-center gap-2"
            >
              <GraduationCap size={14} style={{ color: "hsl(88 45% 40%)" }} />
              <p className="text-[11px] font-medium">국문학 → UX 라이터</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
            What we do
          </p>
          <h2 className="mt-3 text-3xl lg:text-4xl font-extrabold tracking-tight">
            위미가 하는 일이에요
          </h2>
          <p className="mt-3 text-muted-foreground">
            인문계 학생이 진로 앞에서 길을 잃지 않도록, 위미는 세 가지를 도와드려요.
          </p>
        </motion.div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl bg-card border border-card-border p-7 hover-elevate"
            >
              <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <v.icon size={26} style={{ color: "hsl(35 60% 30%)" }} />
              </div>
              <h3 className="mt-5 font-extrabold text-xl tracking-tight">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Jobs preview */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
              Jobs
            </p>
            <h2 className="mt-2 text-3xl lg:text-4xl font-extrabold tracking-tight">
              오늘 살펴볼 직무
            </h2>
          </div>
          <Link href="/jobs">
            <Button variant="outline" className="rounded-full bg-card">
              전체 직무 보기 <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {topJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl bg-card border border-card-border p-6 hover-elevate flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30"
                  style={{ color: "hsl(88 45% 32%)" }}
                >
                  {job.category}
                </span>
                <div className="flex flex-col items-center px-2.5 py-1.5 rounded-xl bg-primary/15">
                  <span className="text-[10px] font-bold tracking-wide" style={{ color: "hsl(35 60% 30%)" }}>
                    적합도
                  </span>
                  <span className="text-lg font-extrabold leading-none mt-0.5" style={{ color: "hsl(35 60% 25%)" }}>
                    {job.fitScore}
                  </span>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight">{job.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
                {job.description}
              </p>
              <div className="mt-5 pt-5 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-3">
                <span>콘텐츠 {job.contentCount}개</span>
                <span>·</span>
                <span>약 {job.estimatedHours}시간</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mentors preview */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
              Mentors
            </p>
            <h2 className="mt-2 text-3xl lg:text-4xl font-extrabold tracking-tight">
              먼저 걸어간 선배들
            </h2>
          </div>
          <Link href="/mentors">
            <Button variant="outline" className="rounded-full bg-card">
              전체 멘토 보기 <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMentors.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl bg-card border border-card-border p-5 hover-elevate"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-14 rounded-2xl ${m.avatarColor} flex items-center justify-center text-xl font-extrabold`}
                  style={{ color: "hsl(30 50% 25%)" }}
                >
                  {m.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.company} · {m.position}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3.5">
                {m.university} {m.major}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {m.expertise.slice(0, 2).map((e) => (
                  <span key={e} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10" style={{ color: "hsl(88 45% 32%)" }}>
                    #{e}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="relative overflow-hidden rounded-[32px] px-10 py-12 lg:px-16 lg:py-16 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center"
          style={{
            background: "linear-gradient(135deg, hsl(45 90% 90%) 0%, hsl(48 80% 96%) 100%)",
          }}
        >
          <div>
            <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              괜찮아요,
              <br />
              차근차근 가요.
            </h3>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-md">
              위미와 함께라면 인문계 진로도 막막하지 않아요.
              <br />
              지금 바로 첫 걸음을 떼어볼까요?
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/jobs">
                <Button size="lg" className="h-13 px-6 rounded-2xl shadow-md">
                  직무 살펴보기
                </Button>
              </Link>
              <Link href="/mentors">
                <Button size="lg" variant="outline" className="h-13 px-6 rounded-2xl bg-card">
                  멘토 둘러보기
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <Mascot size={220} animate="bob" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Stat({ value, label, border }: { value: string; label: string; border?: boolean }) {
  return (
    <div className={`flex flex-col items-center text-center ${border ? "border-x border-border/60" : ""}`}>
      <span className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: "hsl(35 60% 25%)" }}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}
