import { Link } from "wouter";
import { motion } from "framer-motion";
import { LogOut, GraduationCap, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";

export default function Me() {
  const user = useAuth();

  if (!user) {
    return (
      <div>
        <PageHeader title="마이페이지" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-10 text-center"
        >
          <Mascot size={120} animate="float" />
          <h2 className="mt-4 text-xl font-extrabold tracking-tight">아직 로그인하지 않았어요</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            로그인하면 신청한 멘토링과
            <br />
            저장한 직무를 한 곳에서 볼 수 있어요.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/signup">
              <Button size="lg" className="w-full h-12 rounded-2xl">
                회원가입
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="w-full h-12 rounded-2xl">
                로그인
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="마이페이지" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-6"
      >
        <div className="rounded-3xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, hsl(45 80% 92%) 0%, hsl(48 70% 96%) 100%)" }}>
          <Mascot size={64} animate="bob" />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-extrabold tracking-tight">{user.name}님</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {user.university} {user.major}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-card border border-card-border divide-y divide-border/60">
          <Row icon={Mail} label="이메일" value={user.email} />
          <Row icon={GraduationCap} label="전공" value={`${user.university} ${user.major}`} />
          <Row icon={Calendar} label="졸업(예정)" value={`${user.graduationYear}년`} />
        </div>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => signOut()}
          className="w-full h-12 rounded-2xl mt-6 text-muted-foreground"
        >
          <LogOut size={16} className="mr-2" />
          로그아웃
        </Button>
      </motion.div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
