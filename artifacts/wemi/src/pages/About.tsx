import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Users,
  Heart,
  TrendingUp,
  Briefcase,
  Lightbulb,
  Sparkles,
  PenTool,
  BookOpen,
  ArrowRight,
  Star,
  Brain,
  Flower2,
} from "lucide-react";
import { Mascot } from "@/components/Mascot";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, delay },
});

interface ValueCard {
  icon: typeof Heart;
  text: string;
  description: string;
}

const VALUES: ValueCard[] = [
  {
    icon: Users,
    text: "다같이 고민하고 해결합니다",
    description:
      "위미에서는 혼자 어려운 고민을 해결하려는 것이 아닌 다같이 고민을 공유하고 성장하는 공동체 일원이 됩니다.",
  },
  {
    icon: Heart,
    text: "진심을 전달합니다",
    description:
      "졸업생에게 단순한 1회성 정보 제공이나 멘토링을 제공하는 것이 아닌 학생과 졸업생 간의 정서적 교감으로 취업 준비 과정에서 느끼는 고립감과 불안을 해소하고 서로 응원하며 성장합니다.",
  },
  {
    icon: TrendingUp,
    text: "인문학의 가치를 높입니다",
    description:
      "인문학은 결코 비실용적인 학문이 아니며, 인문학을 활용한 다양한 콘텐츠 제작과 창작 활동으로 인문학의 가치를 높입니다.",
  },
];

interface DiffCard {
  icon: typeof Star;
  title: string;
  description: string;
}

const DIFFS: DiffCard[] = [
  {
    icon: Flower2,
    title: "인문계열 특화 플랫폼",
    description: "오로지 인문계열만을 위한 취업 및 진로 정보를 제공",
  },
  {
    icon: Brain,
    title: "AI는 답할 수 없는 상세함",
    description: "AI의 교과서적인 답변을 뛰어넘는 상세한 답변",
  },
  {
    icon: Star,
    title: "인문학 가치와 소양 제고",
    description:
      "인문학을 활용한 창작 활동을 통한 가치 제고, 콘텐츠와 퀴즈로 소양 제고",
  },
];

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
    href: "/career-match",
  },
  {
    icon: Sparkles,
    title: "커리어 매칭",
    desc: "AI가 가장 적합한 직무를 찾아주어요.",
    href: "/career-matching",
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

function HoverCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: typeof Heart;
  title: string;
  description: string;
  accent?: string;
}) {
  return (
    <div className="group relative rounded-3xl bg-card border border-card-border p-7 overflow-hidden cursor-default transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div
        className="size-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: accent ?? "hsl(45 92% 55% / 0.18)" }}
      >
        <Icon size={26} style={{ color: "hsl(35 60% 30%)" }} />
      </div>
      <p className="text-lg font-extrabold tracking-tight leading-snug">{title}</p>

      <div className="absolute inset-0 rounded-3xl bg-foreground/[0.93] flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-background text-sm font-medium leading-relaxed text-center">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-16 space-y-20">

      {/* 헤더 */}
      <motion.div {...fade()} className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <Mascot size={72} animate="float" />
        </div>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: "hsl(45 80% 40%)" }}
        >
          About Us
        </p>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="line-through text-muted-foreground/50">"문송합니다"</span>
          <span className="block mt-1">는 이제 그만!</span>
        </h1>
        <p className="mt-4 text-xl font-semibold text-muted-foreground">
          인문계열 취업의 열쇠,{" "}
          <span className="font-extrabold" style={{ color: "hsl(45 80% 40%)" }}>
            위미(We Me)
          </span>
        </p>
      </motion.div>

      {/* 문제 제기 */}
      <motion.section {...fade()}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "hsl(88 45% 38%)" }}>
          Problem
        </p>
        <div className="space-y-5">
          {[
            {
              quote: "'외교관', '교수', '통번역가'",
              desc: "전공에 얽매인 현실성 없는 진로 가이드",
            },
            {
              quote: '"대체 우리과 선배들은 어디로 취업하지?"',
              desc: "졸업생과의 단절로 인한 정보 부족",
            },
            {
              quote: '"내 경력은 어디서 쌓지?"',
              desc: "경력직 선호 현상으로 경력을 못 쌓는 악순환",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fade(i * 0.1)}
              className="rounded-2xl bg-card border border-border p-6 flex gap-4 items-start"
            >
              <span
                className="shrink-0 size-8 rounded-full flex items-center justify-center text-sm font-extrabold"
                style={{ background: "hsl(45 92% 55% / 0.25)", color: "hsl(35 60% 30%)" }}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-extrabold text-base leading-snug">{item.quote}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div {...fade(0.35)} className="mt-8 rounded-2xl bg-primary/10 border border-primary/20 p-6 text-center">
          <p className="text-sm leading-relaxed text-foreground/80">
            이러한 문제들이 인문계열 전공자 취업의 가장 큰 걸림돌이 되고 있습니다.
          </p>
          <p className="mt-2 text-sm font-bold leading-relaxed">
            위미는 바로 이런 문제들을 해결하고,{" "}
            인문계열 학생들의 취업과 진로를 돕기 위해 탄생했습니다.
          </p>
        </motion.div>
      </motion.section>

      {/* 위미(We Me)의 뜻 */}
      <motion.section {...fade()}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(45 80% 40%)" }}>
          Name &amp; Symbol
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-6">위미(We Me)의 뜻</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="font-extrabold text-base mb-2" style={{ color: "hsl(45 80% 40%)" }}>
              We Me
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              취업에 대한 고민을 가지고 있는 인문계열 전공자끼리{" "}
              <span className="text-foreground font-semibold">함께(We)</span> 배우고 협력하여{" "}
              <span className="text-foreground font-semibold">개인(Me)</span>의 성장을 이끌어낸다는 의미입니다.
            </p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="font-extrabold text-base mb-2" style={{ color: "hsl(88 45% 38%)" }}>
              위미 = 玉米 (옥수수)
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              위미는 중국어로{" "}
              <span className="text-foreground font-semibold">옥수수(玉米)</span>를 의미하여,
              알갱이가 모여 하나의 이삭을 이루듯{" "}
              <span className="text-foreground font-semibold">개인이 모여 공동체를 형성</span>한다는 의미도 가지고 있습니다.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 위미의 가치 */}
      <motion.section {...fade()}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(45 80% 40%)" }}>
          Values
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">위미의 가치</h2>
        <p className="text-sm text-muted-foreground mb-8">카드 위에 마우스를 올려보세요</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <motion.div key={v.text} {...fade(i * 0.1)}>
              <HoverCard icon={v.icon} title={v.text} description={v.description} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 위미의 차별점 */}
      <motion.section {...fade()}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(88 45% 38%)" }}>
          Differentiators
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">위미의 차별점</h2>
        <p className="text-sm text-muted-foreground mb-8">카드 위에 마우스를 올려보세요</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {DIFFS.map((d, i) => (
            <motion.div key={d.title} {...fade(i * 0.1)}>
              <HoverCard
                icon={d.icon}
                title={d.title}
                description={d.description}
                accent="hsl(88 45% 55% / 0.18)"
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 위미의 주요 기능 */}
      <motion.section {...fade()}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(88 45% 38%)" }}>
          Features
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-8">
          위미의 주요 기능을 소개합니다
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fade(i * 0.06)}>
              <Link href={f.href}>
                <button className="w-full text-left rounded-3xl bg-card border border-card-border p-7 hover-elevate group block">
                  <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <f.icon size={26} style={{ color: "hsl(35 60% 30%)" }} />
                  </div>
                  <h3 className="mt-5 font-extrabold text-base tracking-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
                  <span
                    className="mt-4 inline-flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "hsl(35 60% 30%)" }}
                  >
                    바로 가기 <ArrowRight size={14} className="ml-1" />
                  </span>
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
