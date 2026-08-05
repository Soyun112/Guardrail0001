import type { AssignmentMap, Member, TaskItem } from "./types";

/** Keyword affinity by member skill profile. */
const SKILL_KEYWORDS: Record<"A" | "B" | "C", string[]> = {
  A: [
    "조사",
    "분석",
    "리서치",
    "데이터",
    "성과",
    "리포트",
    "예산",
    "경쟁",
    "시장",
    "모니터링",
    "목표",
    "지표",
  ],
  B: [
    "기획",
    "전략",
    "콘텐츠",
    "카피",
    "아이디어",
    "콘셉트",
    "브랜드",
    "메시지",
    "시나리오",
    "크리에이티브",
    "스토리",
  ],
  C: [
    "게시",
    "스케줄",
    "배포",
    "실행",
    "운영",
    "제작",
    "채널",
    "포스팅",
    "최적화",
    "광고",
    "등록",
    "응대",
  ],
};

function skillScore(taskName: string, memberId: "A" | "B" | "C"): number {
  const name = taskName.toLowerCase();
  return SKILL_KEYWORDS[memberId].reduce(
    (sum, kw) => (name.includes(kw.toLowerCase()) ? sum + 1 : sum),
    0,
  );
}

/** Auto-assign by skill affinity, then balance load across members. */
export function autoAssignBySkills(
  tasks: TaskItem[],
  members: Member[] = [],
): AssignmentMap {
  const ids = (members.length
    ? members.map((m) => m.id)
    : (["A", "B", "C"] as const)
  ).filter((id): id is "A" | "B" | "C" => id === "A" || id === "B" || id === "C");

  const counts: Record<"A" | "B" | "C", number> = { A: 0, B: 0, C: 0 };
  const next: AssignmentMap = {};
  const ordered = [...tasks].sort((a, b) => a.order_index - b.order_index);

  for (const task of ordered) {
    const ranked = [...ids]
      .map((id) => ({
        id,
        score: skillScore(task.name, id) * 10 - counts[id],
      }))
      .sort((a, b) => b.score - a.score);
    const pick = ranked[0]?.id ?? "A";
    next[task.id] = pick;
    counts[pick] += 1;
  }

  return next;
}
