import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "hsl(88 45% 38%)" }}>
          Legal
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">이용약관</h1>
        <p className="text-sm text-muted-foreground mb-10">최종 업데이트: 2026년 6월 15일</p>

        <div className="space-y-10 text-sm leading-[1.85] text-foreground/80">

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제1조 (목적)</h2>
            <p>
              본 약관은 위미(이하 "서비스")가 제공하는 인문계열 진로·멘토링 웹 서비스의 이용 조건 및 절차, 운영자와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제2조 (정의)</h2>
            <ul className="space-y-2 list-none">
              {[
                '"서비스"란 위미가 운영하는 웹사이트 및 제공되는 모든 콘텐츠를 의미합니다.',
                '"이용자"란 본 약관에 동의하고 서비스를 이용하는 모든 자를 의미합니다.',
                '"회원"이란 서비스에 이메일로 가입하여 아이디(이메일)와 비밀번호를 부여받은 자를 의미합니다.',
                '"콘텐츠"란 서비스 내에서 제공되는 직무 정보, 멘토 정보, 인문학 아티클, O/X 퀴즈, 창작물 등 일체의 정보를 의미합니다.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제3조 (약관의 효력 및 변경)</h2>
            <p className="mb-2">
              본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 운영자는 필요한 경우 약관을 변경할 수 있으며, 변경 시 서비스 내 공지를 통해 7일 전 사전 안내합니다. 변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제4조 (서비스 이용)</h2>
            <p className="mb-2">서비스의 주요 기능은 다음과 같습니다.</p>
            <ul className="space-y-2 list-none">
              {[
                "인문계열 직무 학습 콘텐츠 열람",
                "졸업생 멘토 프로필 및 아티클 열람, 1:1 멘토링 신청",
                "프로젝트 참여 신청 및 결과 조회",
                "인문학 O/X 퀴즈 참여 및 아티클 열람",
                "창작 공간 작품 열람",
                "익명 커뮤니티 게시판 이용(회원 전용)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·장애·기타 운영 상 필요한 경우 서비스 제공이 일시 중단될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제5조 (회원가입 및 계정 관리)</h2>
            <p className="mb-2">
              이용자는 이메일 주소와 비밀번호를 등록하여 회원가입을 신청할 수 있습니다. 회원은 자신의 계정 정보를 안전하게 관리해야 하며, 계정을 타인에게 양도하거나 대여할 수 없습니다. 타인의 부정 사용으로 인한 피해는 회원 본인이 책임집니다.
            </p>
            <p>
              운영자는 다음에 해당하는 경우 회원가입을 거절하거나 계정을 삭제할 수 있습니다: 허위 정보 기재, 타인 명의 도용, 이용 약관 위반 이력, 기타 서비스 운영에 방해가 되는 경우.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제6조 (이용자의 의무)</h2>
            <p className="mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="space-y-2 list-none">
              {[
                "타인의 개인정보 도용 또는 무단 사용",
                "서비스 내 허위 정보 게시",
                "타인을 비방·모욕하거나 명예를 훼손하는 행위",
                "음란·폭력적·혐오적 콘텐츠 게시",
                "서비스의 안정적 운영을 방해하는 행위(해킹, 무단 크롤링 등)",
                "상업적 광고·홍보 목적의 스팸 게시물 작성",
                "기타 관련 법령 위반 행위",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제7조 (콘텐츠의 저작권)</h2>
            <p className="mb-2">
              서비스가 제작한 직무 정보, 인문학 아티클, O/X 퀴즈 등의 저작권은 운영자에게 귀속됩니다. 이용자는 운영자의 사전 동의 없이 서비스 콘텐츠를 복제·배포·수정·상업적으로 이용할 수 없습니다.
            </p>
            <p>
              이용자가 서비스 내에 작성한 게시글·댓글의 저작권은 해당 이용자에게 있으나, 운영자는 서비스 운영 목적 범위 내에서 이를 활용할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제8조 (면책 사항)</h2>
            <ul className="space-y-2 list-none">
              {[
                "운영자는 천재지변, 전쟁, 불가항력적 사유로 인한 서비스 중단에 대해 책임지지 않습니다.",
                "이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 대해 운영자는 관여하지 않으며, 이로 인한 손해를 배상할 의무가 없습니다.",
                "서비스 내 멘토 정보·직무 정보 등은 참고용이며, 이를 기반으로 한 의사결정에 대한 책임은 이용자 본인에게 있습니다.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제9조 (회원 탈퇴)</h2>
            <p>
              회원은 언제든지 탈퇴를 요청할 수 있으며, 운영자는 즉시 처리합니다. 탈퇴 시 관련 법령에 따라 보존이 필요한 정보를 제외한 개인정보는 지체 없이 삭제됩니다. 탈퇴 문의는 contact@wemi.kr로 연락 주십시오.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">제10조 (준거법 및 분쟁 해결)</h2>
            <p>
              본 약관의 해석 및 분쟁 해결에는 대한민국 법률이 적용됩니다. 서비스 이용과 관련하여 분쟁이 발생하면, 운영자와 이용자는 상호 협의를 통해 해결을 우선 시도합니다. 합의가 이루어지지 않을 경우 관할 법원은 민사소송법상의 관할 법원으로 합니다.
            </p>
          </section>

          <div className="rounded-2xl bg-muted/40 border border-border px-5 py-4 space-y-1 text-xs text-muted-foreground">
            <p><span className="font-semibold text-foreground">서비스명:</span> 위미 (We me)</p>
            <p><span className="font-semibold text-foreground">문의 이메일:</span> zhongwenxibeye@gmail.com</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
