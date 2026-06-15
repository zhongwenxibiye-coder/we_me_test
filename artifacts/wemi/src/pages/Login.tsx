import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = getSupabase();
    if (!supabase) { setError("서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요."); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    else navigate("/");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <Mascot size={56} animate="bob" className="mx-auto" />
          <h1 className="text-3xl font-extrabold tracking-tight">다시 만나요!</h1>
          <p className="text-muted-foreground text-sm">위미에 오신 것을 환영합니다</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-card-border rounded-3xl p-8">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "로그인 중..." : "로그인"}</Button>
          <p className="text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup"><span className="font-semibold text-foreground hover:underline cursor-pointer">회원가입</span></Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
