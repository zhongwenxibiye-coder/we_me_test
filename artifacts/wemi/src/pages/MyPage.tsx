import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, GraduationCap, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function MyPage() {
  const { user, nickname, department, refreshProfile } = useAuth();
  const [, navigate] = useLocation();

  // 닉네임
  const [newNickname, setNewNickname] = useState(nickname ?? "");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameDone, setNicknameDone] = useState(false);

  // 학과
  const [newDepartment, setNewDepartment] = useState(department ?? "");
  const [deptSaving, setDeptSaving] = useState(false);
  const [deptDone, setDeptDone] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);

  // 비밀번호
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">로그인이 필요합니다.</p>
          <Button onClick={() => navigate("/login")}>로그인</Button>
        </div>
      </div>
    );
  }

  const checkNicknameAvailable = async (value: string): Promise<boolean> => {
    if (value.trim() === nickname) return true;
    const supabase = getSupabase();
    if (!supabase) return false;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", value.trim())
      .maybeSingle();
    return !data;
  };

  const handleNicknameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNicknameError(null);
    setNicknameDone(false);
    if (!newNickname.trim()) { setNicknameError("닉네임을 입력해 주세요."); return; }
    if (newNickname.trim().length > 20) { setNicknameError("닉네임은 20자 이하로 입력해 주세요."); return; }

    setNicknameSaving(true);
    const available = await checkNicknameAvailable(newNickname);
    if (!available) {
      setNicknameError("이미 사용 중인 닉네임입니다.");
      setNicknameSaving(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) { setNicknameError("서비스 연결 오류입니다."); setNicknameSaving(false); return; }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, nickname: newNickname.trim() });

    setNicknameSaving(false);
    if (error) {
      setNicknameError(error.code === "23505" ? "이미 사용 중인 닉네임입니다." : "저장 중 오류가 발생했습니다.");
    } else {
      await refreshProfile();
      setNicknameDone(true);
      setTimeout(() => setNicknameDone(false), 3000);
    }
  };

  const handleDeptSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptError(null);
    setDeptDone(false);
    if (newDepartment.length > 50) { setDeptError("50자 이하로 입력해 주세요."); return; }

    const supabase = getSupabase();
    if (!supabase) { setDeptError("서비스 연결 오류입니다."); return; }

    setDeptSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, department: newDepartment.trim() || null });

    setDeptSaving(false);
    if (error) {
      setDeptError("저장 중 오류가 발생했습니다.");
    } else {
      await refreshProfile();
      setDeptDone(true);
      setTimeout(() => setDeptDone(false), 3000);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwDone(false);
    if (newPw.length < 6) { setPwError("새 비밀번호는 6자 이상이어야 합니다."); return; }
    if (newPw !== confirmPw) { setPwError("새 비밀번호가 일치하지 않습니다."); return; }

    const supabase = getSupabase();
    if (!supabase) { setPwError("서비스 연결 오류입니다."); return; }

    setPwSaving(true);
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPw,
    });
    if (reAuthError) {
      setPwError("현재 비밀번호가 올바르지 않습니다.");
      setPwSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwDone(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwDone(false), 3000);
    }
  };

  const isDeptChanged = newDepartment.trim() !== (department ?? "");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "hsl(88 45% 38%)" }}>
          My Page
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">마이페이지</h1>
        <p className="text-sm text-muted-foreground mb-10">{user.email}</p>

        <div className="space-y-6">
          {/* 닉네임 변경 */}
          <div className="bg-card border border-card-border rounded-3xl p-6">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <User size={16} className="text-primary" />닉네임 변경
            </h2>
            <form onSubmit={handleNicknameSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-nickname">새 닉네임</Label>
                <Input
                  id="new-nickname"
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  value={newNickname}
                  onChange={(e) => { setNewNickname(e.target.value); setNicknameError(null); setNicknameDone(false); }}
                  maxLength={20}
                  required
                />
                {nicknameError && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-1.5">{nicknameError}</p>
                )}
                {nicknameDone && (
                  <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />닉네임이 변경됐습니다.
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={nicknameSaving || newNickname.trim() === nickname}>
                  {nicknameSaving ? <><Loader2 size={14} className="mr-1.5 animate-spin" />저장 중</> : "저장"}
                </Button>
              </div>
            </form>
          </div>

          {/* 학과 입력 */}
          <div className="bg-card border border-card-border rounded-3xl p-6">
            <h2 className="font-bold text-base mb-1 flex items-center gap-2">
              <GraduationCap size={16} className="text-primary" />학과
            </h2>
            <p className="text-xs text-muted-foreground mb-4">선택 사항이에요. 입력하지 않아도 됩니다.</p>
            <form onSubmit={handleDeptSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="department">학과명</Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="예: 철학과, 영어영문학과, 사학과 …"
                  value={newDepartment}
                  onChange={(e) => { setNewDepartment(e.target.value); setDeptError(null); setDeptDone(false); }}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground/60">
                  {newDepartment.length > 0
                    ? `${newDepartment.length}/50자`
                    : "비워두면 학과 정보가 삭제됩니다."}
                </p>
                {deptError && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-1.5">{deptError}</p>
                )}
                {deptDone && (
                  <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />학과 정보가 저장됐습니다.
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={deptSaving || !isDeptChanged}>
                  {deptSaving ? <><Loader2 size={14} className="mr-1.5 animate-spin" />저장 중</> : "저장"}
                </Button>
              </div>
            </form>
          </div>

          {/* 비밀번호 변경 */}
          <div className="bg-card border border-card-border rounded-3xl p-6">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Lock size={16} className="text-primary" />비밀번호 변경
            </h2>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">현재 비밀번호</Label>
                <Input
                  id="current-pw"
                  type="password"
                  placeholder="현재 비밀번호"
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwError(null); }}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">새 비밀번호</Label>
                <Input
                  id="new-pw"
                  type="password"
                  placeholder="6자 이상"
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(null); }}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">새 비밀번호 확인</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setPwError(null); }}
                  required
                  autoComplete="new-password"
                />
              </div>
              {pwError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-1.5">{pwError}</p>
              )}
              {pwDone && (
                <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />비밀번호가 변경됐습니다.
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={pwSaving}>
                  {pwSaving ? <><Loader2 size={14} className="mr-1.5 animate-spin" />변경 중</> : "비밀번호 변경"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
