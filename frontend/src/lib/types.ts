export type Verdict = "green" | "amber" | "red";

export type ReasonAxes = {
  accuracy_critical: boolean;
  reversible: boolean;
  judgment_required: boolean;
  summary: string;
};

export type TaskItem = {
  id: string;
  name: string;
  verdict: Verdict;
  reason: ReasonAxes;
  cause_type: string | null;
  recommended_ai: string;
  guide: string;
  order_index: number;
};

export type Member = {
  id: "A" | "B" | "C";
  name: string;
  traits: string[];
  blurb: string;
};

export type GuideItem = {
  task_id: string;
  task_name: string;
  verdict: Verdict;
  recommended_ai: string;
  guide: string;
  how: string;
};

export type AssignmentMap = Record<string, "A" | "B" | "C" | null>;

export const PRESET_PROJECT = "여름 신제품 SNS 캠페인";

/** Catalog shown in 승인 AI 관리 modal */
export const AI_CATALOG = [
  "Gemini",
  "Copilot",
  "ChatGPT",
  "Claude",
  "Perplexity",
] as const;

export const DEFAULT_APPROVED_AI = ["Gemini", "Copilot"];

export const VERDICT_LABEL: Record<Verdict, string> = {
  green: "AI 주도",
  amber: "AI + 사람 협업",
  red: "사람 주도",
};

export const VERDICT_EMOJI: Record<Verdict, string> = {
  green: "🟢",
  amber: "🟡",
  red: "🔴",
};

export function clampRecommendedAi(
  recommended: string | undefined,
  approved: string[],
): string {
  const list = approved.length ? approved : [...DEFAULT_APPROVED_AI];
  if (recommended && list.includes(recommended)) return recommended;
  return list[0];
}
