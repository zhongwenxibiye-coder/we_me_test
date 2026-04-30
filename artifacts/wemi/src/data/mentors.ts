export interface Mentor {
  id: string;
  name: string;
  university: string;
  major: string;
  graduatedYear: number;
  company: string;
  position: string;
  yearsOfExperience: number;
  bio: string;
  expertise: string[];
  rating: number;
  sessionsCount: number;
  avatarColor: string; // tailwind bg classes for placeholder
  initial: string;
}

export const MENTORS: Mentor[] = [
  {
    id: "m-1",
    name: "이서윤",
    university: "연세대",
    major: "국어국문학",
    graduatedYear: 2019,
    company: "토스",
    position: "UX 라이터",
    yearsOfExperience: 5,
    bio: "국문과를 졸업하고 토스에서 UX 라이팅을 맡고 있어요. 글로 사람을 도울 수 있다는 게 늘 신기해요.",
    expertise: ["UX 라이팅", "포트폴리오", "이직 준비"],
    rating: 4.9,
    sessionsCount: 87,
    avatarColor: "bg-amber-200",
    initial: "이",
  },
  {
    id: "m-2",
    name: "박민호",
    university: "고려대",
    major: "철학과",
    graduatedYear: 2017,
    company: "카카오",
    position: "브랜드 매니저",
    yearsOfExperience: 7,
    bio: "철학 전공이 브랜드 일에 이렇게 도움이 될 줄 몰랐어요. 막막한 인문계 후배들과 이야기 나누고 싶어요.",
    expertise: ["브랜드 전략", "커리어 전향", "인문학 활용"],
    rating: 4.8,
    sessionsCount: 124,
    avatarColor: "bg-lime-200",
    initial: "박",
  },
  {
    id: "m-3",
    name: "정수아",
    university: "이화여대",
    major: "사회학",
    graduatedYear: 2020,
    company: "당근",
    position: "콘텐츠 마케터",
    yearsOfExperience: 4,
    bio: "사회학적 시선이 마케팅에서 의외로 무기가 됐어요. 첫 직장 고민하는 분들 환영해요.",
    expertise: ["콘텐츠 마케팅", "신입 채용", "자소서"],
    rating: 4.9,
    sessionsCount: 156,
    avatarColor: "bg-orange-200",
    initial: "정",
  },
  {
    id: "m-4",
    name: "강도현",
    university: "서울대",
    major: "영어영문학",
    graduatedYear: 2016,
    company: "네이버",
    position: "서비스 기획자",
    yearsOfExperience: 8,
    bio: "영문과에서 IT 기획자로 왔어요. 비전공자가 어떻게 기획자가 되는지 솔직하게 알려드릴게요.",
    expertise: ["서비스 기획", "비전공 IT", "PM 전향"],
    rating: 4.7,
    sessionsCount: 98,
    avatarColor: "bg-yellow-200",
    initial: "강",
  },
  {
    id: "m-5",
    name: "윤하영",
    university: "한양대",
    major: "심리학",
    graduatedYear: 2018,
    company: "삼성전자",
    position: "HR 매니저",
    yearsOfExperience: 6,
    bio: "심리학으로 사람을 이해하는 일을 직업으로 삼았어요. 인사 직무 궁금한 분들 편하게 오세요.",
    expertise: ["HR/인사", "대기업 채용", "면접 준비"],
    rating: 4.8,
    sessionsCount: 112,
    avatarColor: "bg-green-200",
    initial: "윤",
  },
  {
    id: "m-6",
    name: "최지우",
    university: "성균관대",
    major: "사학",
    graduatedYear: 2015,
    company: "민음사",
    position: "출판 편집자",
    yearsOfExperience: 9,
    bio: "역사를 공부하고 책을 만드는 사람이 됐어요. 출판·편집 진로 함께 그려볼까요?",
    expertise: ["출판 편집", "기획안 쓰기", "글쓰기"],
    rating: 5.0,
    sessionsCount: 64,
    avatarColor: "bg-amber-300",
    initial: "최",
  },
  {
    id: "m-7",
    name: "한승우",
    university: "중앙대",
    major: "언론정보학",
    graduatedYear: 2019,
    company: "현대자동차",
    position: "PR 매니저",
    yearsOfExperience: 5,
    bio: "대기업 홍보팀에서 일해요. 언론사·홍보 사이에서 고민 중이라면 도와드릴게요.",
    expertise: ["기업 PR", "위기관리", "보도자료"],
    rating: 4.7,
    sessionsCount: 78,
    avatarColor: "bg-lime-300",
    initial: "한",
  },
  {
    id: "m-8",
    name: "김예진",
    university: "서강대",
    major: "사회학",
    graduatedYear: 2017,
    company: "쿠팡",
    position: "데이터 분석가",
    yearsOfExperience: 7,
    bio: "문과에서 데이터 분석으로 전향한 케이스예요. SQL 한 줄도 무서웠던 시절을 기억해요.",
    expertise: ["데이터 분석", "문과 전향", "SQL 입문"],
    rating: 4.9,
    sessionsCount: 142,
    avatarColor: "bg-orange-300",
    initial: "김",
  },
  {
    id: "m-9",
    name: "오수진",
    university: "숙명여대",
    major: "교육학",
    graduatedYear: 2020,
    company: "클래스101",
    position: "교육 기획자",
    yearsOfExperience: 4,
    bio: "에듀테크에서 강의 콘텐츠를 기획해요. 교육·콘텐츠 진로 함께 이야기해요.",
    expertise: ["교육 기획", "에듀테크", "강의 운영"],
    rating: 4.8,
    sessionsCount: 89,
    avatarColor: "bg-yellow-300",
    initial: "오",
  },
];

export const MENTOR_FIELDS = [
  "전체",
  "마케팅",
  "콘텐츠",
  "기획",
  "HR",
  "PR/홍보",
  "데이터",
  "교육",
  "브랜드",
];

export function getMentorById(id: string): Mentor | undefined {
  return MENTORS.find((m) => m.id === id);
}
