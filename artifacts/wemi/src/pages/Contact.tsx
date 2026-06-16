import { motion } from "framer-motion";
import { Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const EMAIL = "zhongwenxibiye@gmail.com";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 lg:px-8 py-16 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.img
          src="/wemi-character.png"
          alt="위미 캐릭터"
          className="mx-auto mb-6 w-28 h-28 object-contain drop-shadow-md"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        />
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "hsl(88 45% 38%)" }}>
          Contact
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">문의하기</h1>
        <p className="text-muted-foreground text-sm mb-12">
          서비스 관련 문의, 제안, 오류 신고 등 무엇이든 편하게 보내주세요.<br />
          영업일 기준 3일 이내에 답변드립니다.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-card-border bg-card p-8 flex flex-col items-center gap-6"
        >
          <div className="size-16 rounded-2xl flex items-center justify-center" style={{ background: "hsl(45 92% 55% / 0.15)" }}>
            <Mail size={28} style={{ color: "hsl(45 92% 40%)" }} />
          </div>

          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">이메일</p>
            <a
              href={`mailto:${EMAIL}`}
              className="text-xl font-bold tracking-tight hover:underline underline-offset-4 transition-colors"
              style={{ color: "hsl(30 35% 18%)" }}
            >
              {EMAIL}
            </a>
          </div>

          <Button
            variant="outline"
            className="rounded-xl gap-2 text-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? "복사됨" : "주소 복사"}
          </Button>
        </motion.div>

        <p className="mt-8 text-xs text-muted-foreground">
          개인정보 관련 문의는{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
            개인정보처리방침
          </a>
          을 먼저 확인해 주세요.
        </p>
      </motion.div>
    </div>
  );
}
