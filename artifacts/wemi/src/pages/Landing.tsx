import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, BookOpen, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { JOBS } from "@/data/jobs";
import { MENTORS } from "@/data/mentors";

const VALUES = [
  {
    icon: BookOpen,
    title: "인문계에 맞는 직무 탐색",
    desc: "전공을 살릴 수 있는 진짜 직무들을, 친절한 설명과 함께 찾아드려요.",
  },
  {
    icon: Users,
    title: "걸어본 졸업생 멘토",
    desc: "같은 전공으로 같은 길을 먼저 걸어간 선배들이 기다리고 있어요.",
  },
  {
    icon: MessageCircleHeart,
    title: "1:1 따뜻한 멘토링",
    desc: "막막한 질문도 괜찮아요. 신청서 한 장이면 대화가 시작돼요.",
  },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative px-6 pt-12 pb-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(45 90% 80%) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute top-40 -left-20 w-64 h-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(88 60% 75%) 0%, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between relative z-10"
        >
          <div className="flex items-center gap-2">
            <Mascot size={36} animate="bob" />
            <span className="font-extrabold text-lg tracking-tight">위미</span>
          </div>
          <Link href="/login">
            <button className="text-sm text-muted-foreground hover-elevate rounded-full px-3 py-1.5">
              로그인
            </button>
          </Link>
        </motion.div>

        <div className="relative z-10 mt-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
          >
            <Mascot size={148} animate="float" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary-foreground text-xs font-medium border border-secondary/30">
              <Sparkles size={12} style={{ color: "hsl(88 45% 45%)" }} />
              <span style={{ color: "hsl(88 45% 35%)" }}>인문계 진로의 따뜻한 동행</span>
            </span>
            <h1 className="mt-4 text-[34px] leading-[1.15] font-extrabold tracking-tight">
              인문계도
              <br />
              <span className="text-primary-foreground">
                <span
                  style={{
                    background: "linear-gradient(135deg, hsl(45 95% 50%), hsl(35 90% 55%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  길은 있어요
                </span>
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed px-2">
              막막한 진로 고민, 혼자 끙끙대지 마세요.
              <br />
              위미가 직무도, 선배도 함께 찾아드릴게요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-7 w-full flex flex-col gap-2.5"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl shadow-md"
              >
                지금 시작하기
                <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                size="lg"
                variant="ghost"
                className="w-full h-12 text-sm rounded-2xl"
              >
                먼저 둘러볼래요
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-3 rounded-3xl bg-card border border-card-border py-5 wemi-soft-shadow"
        >
          <Stat value={`${JOBS.length}+`} label="추천 직무" />
          <div className="border-x border-border/60">
            <Stat value={`${MENTORS.length}명`} label="졸업생 멘토" />
          </div>
          <Stat value="850+" label="누적 멘토링" />
        </motion.div>
      </section>

      {/* Values */}
      <section className="px-6 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-secondary" style={{ color: "hsl(88 45% 38%)" }}>
            What we do
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
            위미가 하는 일이에요
          </h2>
        </motion.div>

        <div className="mt-5 space-y-3">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl bg-card border border-card-border p-5 flex gap-4 hover-elevate"
            >
              <div className="size-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <v.icon size={22} style={{ color: "hsl(35 60% 30%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mentors preview */}
      <section className="px-6 mt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
              Mentors
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
              먼저 걸어간 선배들
            </h2>
          </div>
          <Link href="/mentors">
            <button className="text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5">
              전체 보기
            </button>
          </Link>
        </div>

        <div className="mt-4 -mx-6 px-6 overflow-x-auto">
          <div className="flex gap-3 pb-2 w-max">
            {MENTORS.slice(0, 5).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="w-[200px] shrink-0 rounded-3xl bg-card border border-card-border p-4 hover-elevate"
              >
                <div className={`size-14 rounded-full ${m.avatarColor} flex items-center justify-center text-lg font-bold`} style={{ color: "hsl(30 50% 25%)" }}>
                  {m.initial}
                </div>
                <p className="mt-3 font-bold text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {m.company} · {m.position}
                </p>
                <p className="text-[11px] text-muted-foreground/80 mt-1.5">
                  {m.major} · {m.graduatedYear}년 졸업
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 mt-12 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="relative overflow-hidden rounded-3xl p-7 text-center"
          style={{
            background: "linear-gradient(135deg, hsl(45 90% 90%) 0%, hsl(48 80% 95%) 100%)",
          }}
        >
          <div className="absolute -bottom-4 -right-4 opacity-90">
            <Mascot size={110} animate="bob" />
          </div>
          <div className="relative z-10 text-left max-w-[60%]">
            <h3 className="text-xl font-extrabold leading-tight">
              괜찮아요,
              <br />
              차근차근 가요
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              위미와 함께 첫 걸음을 떼어볼까요?
            </p>
            <Link href="/signup">
              <Button size="sm" className="mt-4 rounded-full">
                무료로 시작
              </Button>
            </Link>
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-muted-foreground/70 mt-8">
          © 2026 위미 · 인문계 진로의 따뜻한 동행
        </p>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-extrabold tracking-tight" style={{ color: "hsl(35 60% 25%)" }}>
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}
