import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";

interface Props {
  title: string;
  caption?: string;
}

export function ComingSoonPage({ title, caption }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <Mascot size={160} animate="float" />
        <p
          className="mt-6 text-xs font-semibold tracking-widest uppercase"
          style={{ color: "hsl(88 45% 38%)" }}
        >
          Coming Soon
        </p>
        <h1 className="mt-2 text-4xl lg:text-5xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {caption ?? "준비 중 입니다."}
        </p>
        <Link href="/">
          <Button variant="outline" size="lg" className="mt-8 rounded-full bg-card">
            <ArrowLeft size={16} className="mr-1.5" />
            홈으로 돌아가기
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export function CareerMatchingPage() {
  return (
    <ComingSoonPage
      title="커리어 매칭"
      caption="AI가 나에게 꼭 맞는 직무를 찾아주는 기능을 준비 중이에요."
    />
  );
}
export function HumanitiesPage() {
  return <ComingSoonPage title="인문학 콘텐츠" />;
}
export function ProjectsPage() {
  return <ComingSoonPage title="프로젝트 참여" />;
}
