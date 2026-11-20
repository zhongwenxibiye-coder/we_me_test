import test from "node:test";
import assert from "node:assert/strict";
import { parseCareerSession } from "./careerExplorationSession.ts";

const question = {
  messages: [{ role: "assistant", content: "어떤 활동이 즐거웠나요?" }],
  result: { status: "question", question: "어떤 활동이 즐거웠나요?", summary: "", answeredCount: 0, recommendations: [] },
};
const complete = {
  messages: Array.from({ length: 10 }, (_, index) => ({ role: index % 2 === 0 ? "assistant" : "user", content: "답변" })),
  result: {
    status: "complete", question: "", summary: "탐색 요약", answeredCount: 5,
    recommendations: [1, 2, 3].map((jobId) => ({ jobId, title: "직무", category: "분야", reason: "근거", nextStep: "학습", href: `/jobs/${jobId}` })),
  },
};

test("question and three-result sessions survive navigation and reload", () => {
  assert.deepEqual(parseCareerSession(JSON.stringify(question)), question);
  assert.deepEqual(parseCareerSession(JSON.stringify(complete)), complete);
});
test("malformed storage and inconsistent conversations safely return to introduction", () => {
  assert.deepEqual(parseCareerSession("{"), { messages: [], result: null });
  assert.deepEqual(parseCareerSession(JSON.stringify({ ...question, messages: [] })), { messages: [], result: null });
  assert.deepEqual(parseCareerSession(JSON.stringify({ ...question, result: { ...question.result, answeredCount: 4 } })), { messages: [], result: null });
});
test("stored recommendations cannot link outside matching learning detail routes", () => {
  const unsafe = structuredClone(complete);
  unsafe.result.recommendations[0].href = "https://example.com";
  assert.deepEqual(parseCareerSession(JSON.stringify(unsafe)), { messages: [], result: null });
  const duplicate = structuredClone(complete);
  duplicate.result.recommendations[1] = duplicate.result.recommendations[0];
  assert.deepEqual(parseCareerSession(JSON.stringify(duplicate)), { messages: [], result: null });
});
