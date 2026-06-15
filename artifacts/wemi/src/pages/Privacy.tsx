import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "hsl(88 45% 38%)" }}>
          Legal
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">개인정보처리방침</h1>
        <p className="text-sm text-muted-foreground mb-10">최종 업데이트: 2026년 6월 15일</p>

        <div className="prose-wemi space-y-10 text-sm leading-[1.85] text-foreground/80">

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. 총칙</h2>
            <p>
              위미(이하 "서비스")는 인문계열 대학생을 위한 진로·멘토링 웹 서비스입니다. 서비스 운영자(이하 "운영자")는 이용자의 개인정보를 중요하게 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침은 운영자가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 및 이용자의 권리에 대해 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. 수집하는 개인정보 항목</h2>
            <p className="mb-3">운영자는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">수집 시점</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">수집 항목</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">수집 목적</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 align-top font-medium">회원가입</td>
                    <td className="px-4 py-3 align-top">이메일 주소, 닉네임, 비밀번호(암호화)</td>
                    <td className="px-4 py-3 align-top">회원 식별 및 서비스 이용</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium">프로필 설정(선택)</td>
                    <td className="px-4 py-3 align-top">학과명</td>
                    <td className="px-4 py-3 align-top">맞춤형 콘텐츠 제공</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium">멘토링 신청</td>
                    <td className="px-4 py-3 align-top">이름, 연락처(이메일), 상담 주제, 신청 내용</td>
                    <td className="px-4 py-3 align-top">멘토링 연결 및 운영</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium">창업 신청</td>
                    <td className="px-4 py-3 align-top">신청자 정보, 아이디어 내용</td>
                    <td className="px-4 py-3 align-top">프로젝트 매칭</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium">서비스 이용</td>
                    <td className="px-4 py-3 align-top">접속 기록, 쿠키, 브라우저 세션 키</td>
                    <td className="px-4 py-3 align-top">서비스 운영 및 통계 분석</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <ul className="space-y-2 list-none">
              {[
                "회원 정보: 회원 탈퇴 시까지",
                "멘토링·창업 신청 정보: 신청일로부터 3년",
                "서비스 이용 기록(쿠키 등): 최대 1년",
                "관계 법령에 의해 보존이 필요한 경우 해당 법령에서 정한 기간",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. 개인정보의 제3자 제공</h2>
            <p>
              운영자는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령의 규정에 따라 수사기관 등이 요구하는 경우에는 예외적으로 제공할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. 개인정보의 처리 위탁</h2>
            <p className="mb-3">운영자는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">수탁 업체</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Supabase Inc.</td>
                    <td className="px-4 py-3">회원 인증 및 데이터베이스 운영</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. 쿠키(Cookie) 정책</h2>
            <p>
              서비스는 로그인 세션 유지 및 퀴즈 참여 기록 저장을 위해 브라우저 로컬스토리지 및 세션 쿠키를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 기능 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. 이용자의 권리</h2>
            <p className="mb-2">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-2 list-none">
              {[
                "자신의 개인정보 열람 요청",
                "오류가 있는 경우 정정 요청",
                "삭제(탈퇴) 요청",
                "처리 정지 요청",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              권리 행사는 마이페이지에서 직접 수행하거나, 아래 이메일로 문의하시면 됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. 개인정보 보호책임자 및 문의</h2>
            <div className="rounded-2xl bg-muted/40 border border-border px-5 py-4 space-y-1">
              <p><span className="font-semibold">서비스명:</span> 위미 (Wemi)</p>
              <p><span className="font-semibold">이메일:</span> contact@wemi.kr</p>
            </div>
            <p className="mt-3">
              개인정보 관련 불만·문의는 위 이메일로 접수하시면 영업일 기준 3일 이내 답변드립니다. 또한 개인정보 침해에 관한 신고·상담은 개인정보 보호위원회(privacy.go.kr) 또는 한국인터넷진흥원(118)에 문의하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">9. 방침 변경</h2>
            <p>
              본 개인정보처리방침은 법령·서비스 변경에 따라 개정될 수 있습니다. 변경 시 서비스 내 공지사항을 통해 사전 안내합니다.
            </p>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
