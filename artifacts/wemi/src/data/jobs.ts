export type JobCategory = "마케팅" | "기획" | "콘텐츠" | "교육" | "데이터" | "HR" | "PR/홍보" | "브랜드";

export type JobLevel = "입문" | "초급" | "중급";

export interface Job {
  id: string;
  title: string;
  category: JobCategory;
  level: JobLevel;
  description: string;
  contentCount: number;
  fitScore: number; // 0~100, 인문계 친화도
  highlights: string[];
  estimatedHours: number;
  recommendedMajors: string[];
}

export const JOBS: Job[] = [
  {
    id: "content-marketer",
    title: "콘텐츠 마케터",
    category: "마케팅",
    level: "입문",
    description: "글과 이야기로 사람을 움직이는 직무예요. 인문계 전공자가 가장 자연스럽게 시작할 수 있어요.",
    contentCount: 12,
    fitScore: 95,
    highlights: ["글쓰기 강점 활용", "포트폴리오 제작 가이드", "실제 캠페인 사례"],
    estimatedHours: 18,
    recommendedMajors: ["국문학", "영문학", "문예창작", "미디어"],
  },
  {
    id: "ux-writer",
    title: "UX 라이터",
    category: "콘텐츠",
    level: "초급",
    description: "앱과 웹 속 한 줄의 문장을 짓는 일이에요. 언어 감각이 곧 실력이 되는 신생 직무예요.",
    contentCount: 8,
    fitScore: 92,
    highlights: ["문장 다듬기 워크북", "토스·카카오 사례", "UX 기초"],
    estimatedHours: 14,
    recommendedMajors: ["국문학", "언어학", "심리학", "철학"],
  },
  {
    id: "publishing-editor",
    title: "출판 편집자",
    category: "콘텐츠",
    level: "중급",
    description: "책을 기획하고 다듬어 세상에 내보내는 직무예요. 깊이 있는 독서력이 자산이 돼요.",
    contentCount: 10,
    fitScore: 90,
    highlights: ["기획안 쓰기", "교정·교열 실습", "현직자 인터뷰"],
    estimatedHours: 22,
    recommendedMajors: ["국문학", "사학", "철학", "문예창작"],
  },
  {
    id: "hr-recruiter",
    title: "HR · 인사",
    category: "HR",
    level: "초급",
    description: "사람을 이해하고 조직을 키우는 일이에요. 사회과학적 사고가 빛을 발해요.",
    contentCount: 9,
    fitScore: 85,
    highlights: ["채용 프로세스", "조직문화 설계", "노동법 기초"],
    estimatedHours: 16,
    recommendedMajors: ["심리학", "사회학", "경영학", "교육학"],
  },
  {
    id: "pr-specialist",
    title: "PR · 홍보",
    category: "PR/홍보",
    level: "초급",
    description: "브랜드의 목소리를 만들고, 위기 상황에 대응하는 직무예요. 글쓰기와 관계 맺기가 핵심이에요.",
    contentCount: 7,
    fitScore: 88,
    highlights: ["보도자료 작성", "위기 커뮤니케이션", "미디어 관계"],
    estimatedHours: 12,
    recommendedMajors: ["언론정보학", "사회학", "국문학"],
  },
  {
    id: "education-planner",
    title: "교육 기획자",
    category: "교육",
    level: "초급",
    description: "사람의 성장을 설계하는 직무예요. 교육 콘텐츠를 만들고 운영해요.",
    contentCount: 11,
    fitScore: 87,
    highlights: ["커리큘럼 설계", "학습자 인터뷰", "에듀테크 동향"],
    estimatedHours: 20,
    recommendedMajors: ["교육학", "심리학", "국문학"],
  },
  {
    id: "data-analyst-hum",
    title: "데이터 분석가 (인문계 전향)",
    category: "데이터",
    level: "중급",
    description: "통계와 도구를 익히면 인문계 강점인 '맥락 해석력'이 더 빛나는 직무예요.",
    contentCount: 15,
    fitScore: 70,
    highlights: ["SQL 기초", "엑셀·파이썬", "전향 커리어 로드맵"],
    estimatedHours: 40,
    recommendedMajors: ["사회학", "경제학", "심리학", "통계학"],
  },
  {
    id: "brand-manager",
    title: "브랜드 매니저",
    category: "브랜드",
    level: "중급",
    description: "브랜드의 정체성과 톤을 다듬어요. 인문학적 통찰이 중요한 직무예요.",
    contentCount: 9,
    fitScore: 86,
    highlights: ["브랜드 보이스", "포지셔닝", "사례 분석"],
    estimatedHours: 18,
    recommendedMajors: ["철학", "미학", "국문학", "경영학"],
  },
  {
    id: "service-planner",
    title: "서비스 기획자",
    category: "기획",
    level: "초급",
    description: "사용자를 깊이 이해하고 서비스를 설계해요. 관찰력과 논리적 글쓰기가 무기예요.",
    contentCount: 13,
    fitScore: 84,
    highlights: ["기획서 작성", "사용자 리서치", "와이어프레임 기초"],
    estimatedHours: 24,
    recommendedMajors: ["심리학", "사회학", "철학"],
  },
  {
    id: "policy-researcher",
    title: "정책·연구원",
    category: "기획",
    level: "중급",
    description: "사회 문제를 깊이 들여다보고 해결책을 제안하는 직무예요. 비판적 사고력이 핵심이에요.",
    contentCount: 6,
    fitScore: 80,
    highlights: ["연구 방법론", "정책 보고서", "공공기관 진출"],
    estimatedHours: 28,
    recommendedMajors: ["사회학", "정치외교학", "행정학"],
  },
];

export const JOB_CATEGORIES: JobCategory[] = [
  "마케팅",
  "콘텐츠",
  "기획",
  "교육",
  "HR",
  "PR/홍보",
  "브랜드",
  "데이터",
];
