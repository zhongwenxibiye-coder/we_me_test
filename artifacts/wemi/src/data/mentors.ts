import type { JobCategory } from "@/data/jobs";
import { JOB_CATEGORIES } from "@/data/jobs";

export interface Mentor {
  id: string;
  name: string;
  major: string;
  yearsOfExperience: number;
  bio: string;
  mentoringFields: string[]; // 멘토링 가능한 직무 (자유 텍스트)
  categories: JobCategory[]; // 필터에 사용되는 직무 카테고리
  avatarColor: string;
  initial: string;
}

export const MENTORS: Mentor[] = [
  {
    id: "soso-saeng",
    name: "소소생",
    major: "중어중문학",
    yearsOfExperience: 12,
    bio: "유튜브 채널 소소생TV를 운영하고 있습니다. 지금까지 200명의 구독자의 고민 상담을 진행했습니다. 남에게는 아무 것도 아닌 고민이 나에게는 죽을 만큼 힘든 고민일 수도 있습니다.",
    mentoringFields: ["취업·진로·학습 관련 모든 분야"],
    categories: [...JOB_CATEGORIES],
    avatarColor: "bg-amber-200",
    initial: "소",
  },
];

export const MENTOR_FIELDS: ("전체" | JobCategory)[] = [
  "전체",
  ...JOB_CATEGORIES,
];

export function getMentorById(id: string): Mentor | undefined {
  return MENTORS.find((m) => m.id === id);
}
