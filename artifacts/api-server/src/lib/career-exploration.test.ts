import test from "node:test";
import assert from "node:assert/strict";
import { validateInterview, resolveRecommendations } from "./career-exploration.ts";

test("interview starts empty and requires alternating questions and answers", () => {
  assert.equal(validateInterview([]), 0);
  assert.equal(validateInterview([{ role: "assistant", content: "활동?" }, { role: "user", content: "글쓰기" }]), 1);
  assert.throws(() => validateInterview([{ role: "user", content: "추천" }, { role: "assistant", content: "질문" }]));
  assert.throws(() => validateInterview([{ role: "assistant", content: "질문" }]));
  assert.throws(() => validateInterview([{ role: "assistant", content: "질문" }, { role: "user", content: "   " }]));
});

const jobs = [1, 2, 3].map((id) => ({ id, title: `직무 ${id}`, category: "분야" }));
const suggestions = [1, 2, 3].map((jobId) => ({ jobId, reason: "답변 근거", nextStep: "학습하기" }));

test("three catalog recommendations resolve to the existing detail learning routes", () => {
  const results = resolveRecommendations(suggestions, jobs);
  assert.deepEqual(results.map((r) => r.href), ["/jobs/1", "/jobs/2", "/jobs/3"]);
  assert.deepEqual(results.map((r) => r.title), jobs.map((j) => j.title));
});

test("hallucinated, removed, duplicate or fewer than three jobs cannot be recommended", () => {
  assert.throws(() => resolveRecommendations(suggestions.slice(0, 2), jobs));
  assert.throws(() => resolveRecommendations([suggestions[0], suggestions[0], suggestions[2]], jobs));
  assert.throws(() => resolveRecommendations(suggestions, jobs.slice(0, 2)));
  assert.throws(() => resolveRecommendations([{ ...suggestions[0], jobId: 999 }, ...suggestions.slice(1)], jobs));
});
