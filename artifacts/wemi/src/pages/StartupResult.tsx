import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useGetStartupApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";

export default function StartupResult() {
  const [, params] = useRoute("/career-match/result/:id");
  const id = params?.id ? parseInt(params.id, 10) : NaN;

  const { data, isLoading, isError } = useGetStartupApplication(isNaN(id) ? 0 : id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 lg:px-10 py-16 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-6 lg:px-10 py-16 text-center">
        <Mascot size={120} animate="bob" />
        <p className="mt-4 font-semibold">신청 내역을 찾을 수 없어요</p>
        <Link href="/career-match">
          <Button className="mt-5 rounded-full">커리어 매칭으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 lg:px-10 py-12 lg:py-16">
      <Link href="/career-match">
        <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover-elevate rounded-full px-3 py-1.5 -ml-3">
          <ChevronLeft size={16} />
          커리어 매칭
        </button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-3xl bg-card border border-card-border p-8 text-center"
      >
        {!data.result ? (
          <>
            <Clock size={56} className="mx-auto text-muted-foreground" />
            <p className="mt-4 text-xl font-extrabold tracking-tight">검토 중입니다</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {data.founderName}님의 창업 아이디어를 검토하고 있습니다.
              <br />운영자 확인 후 결과를 알려드릴게요.
            </p>
          </>
        ) : data.result === "도전가능" ? (
          <>
            <CheckCircle2 size={56} className="mx-auto" style={{ color: "hsl(88 55% 45%)" }} />
            <p className="mt-4 text-xl font-extrabold tracking-tight text-green-700">도전 가능합니다!</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {data.founderName}님의 창업 아이디어에 대해 멘토링을 진행할 수 있어요.
              <br />등록하신 이메일로 연락드릴게요.
            </p>
          </>
        ) : (
          <>
            <XCircle size={56} className="mx-auto" style={{ color: "hsl(0 70% 55%)" }} />
            <p className="mt-4 text-xl font-extrabold tracking-tight text-red-700">현재 도전이 어렵습니다</p>
            {data.resultReason && (
              <div className="mt-4 rounded-2xl bg-muted/40 p-4 text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">불가 사유</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.resultReason}</p>
              </div>
            )}
          </>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          신청 번호: #{data.id}
        </p>
      </motion.div>
    </div>
  );
}
