export type JobCategory =
  | "영업"
  | "마케팅"
  | "홍보"
  | "기획"
  | "일반사무/공공기관"
  | "IR"
  | "기타";

export interface LearningItem {
  title: string;
  content: string; // 빈 문자열이면 "내용 추가 예정"
}

export interface SubJob {
  id: string;
  title: string;
  category: JobCategory;
  image?: string;
  topRecommended?: boolean;
  shortDescription: string;
  learning: LearningItem[];
}

export const JOB_CATEGORIES: JobCategory[] = [
  "영업",
  "마케팅",
  "홍보",
  "기획",
  "일반사무/공공기관",
  "IR",
  "기타",
];

export const SUB_JOBS: SubJob[] = [
  {
    id: "domestic-sales",
    title: "국내 영업",
    category: "영업",
    image: "job-domestic-sales.png",
    topRecommended: true,
    shortDescription:
      "인문계열 졸업생 중 두 명 중 한 명은 국내 영업으로 사회생활을 시작합니다.",
    learning: [
      {
        title: "국내 영업의 정의",
        content:
          "국내 영업은 국내 시장을 대상으로 기업의 제품이나 서비스를 기업이나 일반 개인 고객에게 판매하는 일을 합니다. 이러한 일을 하는 사람을 영업 사원이라고 하며 영업 사원 개개인 별로 월별, 분기별, 연도별 목표 할당 금액이 정해져 있거나, 팀 별로 영업 목표가 정해져 있는 것이 일반적입니다.",
      },
      {
        title: "국내 영업의 특징",
        content:
          "국내 영업은 인문계열이 가장 많이 선택하는 직무 중에 하나에요. 어느 회사에게나 꼭 필요한 직무이고, 크게 전공 지식이 필요 없는 직무라 전공 무관으로 많이 뽑습니다. 또한, 외근과 출장이 잦으며,",
      },
      { title: "국내 영업의 장단점", content: "" },
      { title: "업종 별 국내 영업의 특징", content: "" },
      { title: "국내 영업에서 성과 내기", content: "" },
      { title: "선배들의 조언", content: "" },
    ],
  },
];

export function getSubJobsByCategory(category: JobCategory): SubJob[] {
  return SUB_JOBS.filter((j) => j.category === category);
}

export function getSubJobById(id: string): SubJob | undefined {
  return SUB_JOBS.find((j) => j.id === id);
}
