import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const checkNickname = async (value: string) => {
    setNicknameError(null);
    if (!value.trim()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", value.trim())
      .maybeSingle();
    if (data) setNicknameError("이미 사용 중인 닉네임입니다.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nickname.trim()) { setError("닉네임을 입력해 주세요."); return; }
    if (nicknameError) { setError(nicknameError); return; }
    if (password !== confirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }

    const supabase = getSupabase();
    if (!supabase) { setError("서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요."); return; }

    setLoading(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signUpErr) { setLoading(false); setError(signUpErr.message); return; }

    if (data.user) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, nickname: nickname.trim() });
      if (profileErr) {
        setLoading(false);
        setError(profileErr.code === "23505"
          ? "이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해 주세요."
          : "닉네임 저장 중 오류가 발생했습니다.");
        return;
      }
    }

    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-4">
          <Mascot size={64} animate="bob" className="mx-auto" />
          <h2 className="text-2xl font-extrabold">가입 완료!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            입력하신 이메일로 확인 메일을 보냈습니다.<br />메일함을 확인하고 인증을 완료해 주세요.
          </p>
          <Button className="w-full" onClick={() => navigate("/login")}>로그인하러 가기</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <Mascot size={56} animate="bob" className="mx-auto" />
          <h1 className="text-3xl font-extrabold tracking-tight">위미 회원가입</h1>
          <p className="text-muted-foreground text-sm">이메일로 간편하게 시작하세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-card-border rounded-3xl p-8">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="커뮤니티에서 사용할 이름"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setNicknameError(null); }}
              onBlur={() => checkNickname(nickname)}
              required
              maxLength={20}
              autoComplete="username"
            />
            {nicknameError && (
              <p className="text-xs text-destructive">{nicknameError}</p>
            )}
            <p className="text-xs text-muted-foreground">커뮤니티 글쓰기, 마이페이지에서 사용됩니다.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="6자 이상" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">비밀번호 확인</Label>
            <Input id="confirm" type="password" placeholder="비밀번호를 다시 입력하세요" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !!nicknameError}>
            {loading ? "가입 중..." : "회원가입"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login"><span className="font-semibold text-foreground hover:underline cursor-pointer">로그인</span></Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
