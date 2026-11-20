export type InterviewMessage = { role: "user" | "assistant"; content: string };
export type LearningJob = { id: number; title: string; category: string };
export type SuggestedJob = { jobId: number; reason: string; nextStep: string };

export function validateInterview(messages: InterviewMessage[]): number {
  if (messages.length === 0) return 0;
  if (messages.length > 10 || messages.length % 2 !== 0) {
    throw new Error("대화 순서가 올바르지 않습니다. 다시 시작해 주세요.");
  }
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role !== (i % 2 === 0 ? "assistant" : "user") || !messages[i].content.trim()) {
      throw new Error("질문과 답변을 차례로 입력해 주세요.");
    }
  }
  return messages.length / 2;
}

export function resolveRecommendations(suggestions: SuggestedJob[], jobs: LearningJob[]) {
  if (suggestions.length !== 3 || new Set(suggestions.map((s) => s.jobId)).size !== 3) {
    throw new Error("Expected three distinct recommendations");
  }
  return suggestions.map((suggestion) => {
    const job = jobs.find((item) => item.id === suggestion.jobId);
    if (!job || !suggestion.reason.trim() || !suggestion.nextStep.trim()) {
      throw new Error("Recommendation is not a published learning job");
    }
    return {
      ...suggestion,
      title: job.title,
      category: job.category,
      href: `/jobs/${job.id}`,
    };
  });
}
