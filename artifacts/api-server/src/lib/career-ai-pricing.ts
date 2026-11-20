// Public GPT-5.4 mini standard text prices: $0.75 / 1M input, $4.50 / 1M output.
// Integer nanodollars avoid floating-point budget comparisons. $1 = 1,000,000,000.
export const DAILY_BUDGET_NANO_USD = 1_000_000_000;
export const INPUT_TOKEN_NANO_USD = 750;
export const OUTPUT_TOKEN_NANO_USD = 4500;
export const BUDGET_SCOPE = "career-usd-nano-v1";

export function tokenCostNanoUsd(inputTokens: number, outputTokens: number) {
  if (![inputTokens, outputTokens].every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("Invalid token usage");
  }
  return inputTokens * INPUT_TOKEN_NANO_USD + outputTokens * OUTPUT_TOKEN_NANO_USD;
}

export function reserveEstimateNanoUsd(payload: unknown, maxOutputTokens: number) {
  // Byte-level BPE cannot produce more text tokens than UTF-8 bytes. Include the
  // entire request (messages AND JSON schema), plus 8192 tokens for framing/schema
  // expansion. Do not use a language-specific chars/4 heuristic for Korean.
  const bytes = Buffer.byteLength(JSON.stringify(payload), "utf8");
  if (bytes > 200_000) throw new Error("AI 입력이 너무 큽니다. 운영자에게 문의해 주세요.");
  return tokenCostNanoUsd(bytes + 8192, maxOutputTokens);
}
