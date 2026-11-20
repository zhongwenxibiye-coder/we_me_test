import type { CareerExplorationMessage, CareerExplorationResult } from "@workspace/api-client-react";

export const CAREER_STORAGE_KEY = "wemi.careerExploration.v1";
export interface CareerExplorationSaved {
  messages: CareerExplorationMessage[];
  result: CareerExplorationResult | null;
}

function isMessage(value: unknown): value is CareerExplorationMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant")
    && typeof message.content === "string"
    && message.content.trim().length > 0 && message.content.length <= 2000;
}

function isResult(value: unknown): value is CareerExplorationResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  if (result.status !== "question" && result.status !== "complete") return false;
  if (typeof result.question !== "string" || typeof result.summary !== "string"
    || typeof result.answeredCount !== "number" || !Number.isInteger(result.answeredCount)
    || result.answeredCount < 0 || result.answeredCount > 5) return false;
  if (!Array.isArray(result.recommendations)) return false;
  if (result.status === "question" && (!result.question.trim() || result.recommendations.length !== 0)) return false;
  if (result.status === "complete" && (result.recommendations.length !== 3
    || new Set(result.recommendations.map((r) => r?.jobId)).size !== 3)) return false;
  return result.recommendations.every((value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const rec = value as Record<string, unknown>;
    return Number.isInteger(rec.jobId) && Number(rec.jobId) > 0
      && ["title", "category", "reason", "nextStep"].every((key) => typeof rec[key] === "string")
      && rec.href === `/jobs/${rec.jobId}`;
  });
}

export function parseCareerSession(raw: string | null): CareerExplorationSaved {
  const empty: CareerExplorationSaved = { messages: [], result: null };
  if (!raw) return empty;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return empty;
    const saved = parsed as Record<string, unknown>;
    if (!Array.isArray(saved.messages) || saved.messages.length > 10 || !saved.messages.every(isMessage)) return empty;
    if (!saved.messages.every((message, index) => message.role === (index % 2 === 0 ? "assistant" : "user"))) return empty;
    if (!isResult(saved.result)) return empty;
    const users = saved.messages.filter((message) => message.role === "user").length;
    if (saved.result.answeredCount !== users) return empty;
    if (saved.result.status === "complete" ? users !== 5 : saved.messages.at(-1)?.role !== "assistant" || users >= 5) return empty;
    return { messages: saved.messages, result: saved.result };
  } catch {
    return empty;
  }
}

export function loadCareerSession(): CareerExplorationSaved {
  try {
    return parseCareerSession(sessionStorage.getItem(CAREER_STORAGE_KEY));
  } catch {
    return { messages: [], result: null };
  }
}
