import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  Lightbulb,
  Sparkles,
  PenTool,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Mascot, WemiWordmark } from "@/components/Mascot";

interface FeatureCard {
  icon: typeof Briefcase;
  title: string;
  desc: string;
  href: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: Briefcase,
    title: "인문계열이 선택 가능한 직무",
    desc: "인문계열이 할 수 있는 직무와 준비 방법을 소개하고 있어요.",
    href: "/jobs",
  },
  {
    icon: Users,
    title: "졸업생 멘토링",
    desc: "실제 현업에 종사하고 있는 졸업생 선배의 따뜻한 멘토링.",
    href: "/mentors",
  },
  {
    icon: Lightbulb,
    title: "프로젝트 참여",
    desc: "실제 기업에서 내 준 과제를 수행하여 경험을 쌓아요.",
    href: "/projects",
  },
  {
    icon: Sparkles,
    title: "커리어 매칭",
    desc: "AI가 가장 적합한 직무를 찾아주어요.",
    href: "/career-match",
  },
  {
    icon: PenTool,
    title: "창작 공간",
    desc: "전공을 살려 다양한 창작물(소설, 에세이 등)을 창작해 보세요.",
    href: "/creative-space",
  },
  {
    icon: BookOpen,
    title: "인문학 콘텐츠",
    desc: "하루 한번 인문학 상식 쌓기!",
    href: "/humanities",
  },
];

export default function Landing() {
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

        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 pt-16 pb-12 lg:pt-24 lg:pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl lg:text-2xl font-semibold text-foreground/80 leading-snug">
              인문계열을 위한 취업 플랫폼
            </p>
            <h1
              className="mt-3 text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight leading-none"
              style={{
                background: "linear-gradient(135deg, hsl(45 95% 50%), hsl(35 90% 55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              위미
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              전공에 얽매이지 않고 진로의 폭을 넓혀보세요.
            </p>
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 18 }}
            className="relative flex flex-col items-center justify-center min-h-[360px]"
          >
            <Mascot size={300} animate="float" />
            <div className="mt-2">
              <WemiWordmark height={64} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(88 45% 38%)" }}>
            Features
          </p>
          <h2 className="mt-3 text-3xl lg:text-4xl font-extrabold tracking-tight">
            위미의 주요 기능을 소개합니다
          </h2>
        </motion.div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={f.href}>
                <button className="w-full text-left rounded-3xl bg-card border border-card-border p-7 hover-elevate group block">
                  <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <f.icon size={26} style={{ color: "hsl(35 60% 30%)" }} />
                  </div>
                  <h3 className="mt-5 font-extrabold text-xl tracking-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "hsl(35 60% 30%)" }}>
                    바로 가기 <ArrowRight size={14} className="ml-1" />
                  </span>
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
