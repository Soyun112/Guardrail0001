import {
  VERDICT_EMOJI,
  VERDICT_LABEL,
  type GuideItem,
  type Member,
  type TaskItem,
  type Verdict,
} from "./types";

export type ResultEmailPayload = {
  projectInput: string;
  members: Member[];
  tasks: TaskItem[];
  assignments: Record<string, "A" | "B" | "C" | null | undefined>;
  guides: GuideItem[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function guideFor(
  task: TaskItem,
  guideMap: Map<string, GuideItem>,
): { ai: string; guide: string } {
  const g = guideMap.get(task.id);
  return {
    ai: g?.recommended_ai || task.recommended_ai,
    guide: g?.guide || task.guide,
  };
}

function groupByMember(payload: ResultEmailPayload) {
  const guideMap = new Map(payload.guides.map((g) => [g.task_id, g]));
  const byMember = payload.members.map((member) => ({
    member,
    tasks: payload.tasks.filter((t) => payload.assignments[t.id] === member.id),
  }));
  const unassigned = payload.tasks.filter((t) => !payload.assignments[t.id]);
  return { guideMap, byMember, unassigned };
}

function verdictChip(verdict: Verdict): string {
  const colors: Record<Verdict, { bg: string; fg: string }> = {
    green: { bg: "#dcfce7", fg: "#166534" },
    amber: { bg: "#fef3c7", fg: "#92400e" },
    red: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const c = colors[verdict];
  return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${c.bg};color:${c.fg};font-size:11px;font-weight:700;letter-spacing:0.02em;">${VERDICT_EMOJI[verdict]} ${VERDICT_LABEL[verdict]}</span>`;
}

export function buildResultEmailSubject(projectInput: string): string {
  const short =
    projectInput.length > 40 ? `${projectInput.slice(0, 40)}…` : projectInput;
  return `[가드레일] ${short} · 업무 분배 결과`;
}

export function buildResultEmailPlainText(payload: ResultEmailPayload): string {
  const { guideMap, byMember, unassigned } = groupByMember(payload);
  const lines: string[] = [
    "가드레일 · 업무 분배 결과",
    "────────────────────────",
    `프로젝트: ${payload.projectInput}`,
    "",
  ];

  for (const { member, tasks } of byMember) {
    lines.push(`■ ${member.name} (${member.traits.join(" · ")})`);
    if (!tasks.length) {
      lines.push("  · 배정된 업무 없음");
    } else {
      for (const task of tasks) {
        const { ai, guide } = guideFor(task, guideMap);
        lines.push(
          `  · ${VERDICT_EMOJI[task.verdict]} ${task.name}`,
          `    판정: ${VERDICT_LABEL[task.verdict]} · 쓸 AI: ${ai}`,
          `    가이드: ${guide}`,
        );
      }
    }
    lines.push("");
  }

  if (unassigned.length) {
    lines.push("■ 미배정");
    for (const task of unassigned) {
      lines.push(
        `  · ${VERDICT_EMOJI[task.verdict]} ${task.name} (${VERDICT_LABEL[task.verdict]})`,
      );
    }
    lines.push("");
  }

  lines.push(
    "────────────────────────",
    "본 결과는 기술·업무 참고용이며 법적·규제 자문이 아닙니다.",
    "가드레일 (Guardrail)",
  );
  return lines.join("\n");
}

export function buildResultEmailHtml(payload: ResultEmailPayload): string {
  const { guideMap, byMember, unassigned } = groupByMember(payload);
  const project = escapeHtml(payload.projectInput);
  const date = new Date().toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const memberBlocks = byMember
    .map(({ member, tasks }) => {
      const traits = member.traits
        .map(
          (t) =>
            `<span style="display:inline-block;margin:0 4px 4px 0;padding:2px 8px;border:1px solid #d1d9d5;background:#f0f4f2;color:#3d4f47;font-size:11px;">${escapeHtml(t)}</span>`,
        )
        .join("");

      const taskRows =
        tasks.length === 0
          ? `<p style="margin:12px 0 0;color:#8a9a93;font-size:13px;">배정된 업무 없음</p>`
          : tasks
              .map((task) => {
                const { ai, guide } = guideFor(task, guideMap);
                return `
              <tr>
                <td style="padding:12px 0;border-top:1px solid #e8eeeb;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:14px;font-weight:700;color:#0f1a16;padding-right:8px;">
                        ${escapeHtml(task.name)}
                      </td>
                      <td align="right" style="white-space:nowrap;">
                        ${verdictChip(task.verdict)}
                      </td>
                    </tr>
                  </table>
                  <p style="margin:8px 0 0;font-size:12px;color:#3d4f47;">
                    <strong style="color:#0f766e;">쓸 AI</strong> · ${escapeHtml(ai)}
                  </p>
                  <p style="margin:6px 0 0;font-size:13px;line-height:1.55;color:#4a5c54;">
                    ${escapeHtml(guide)}
                  </p>
                </td>
              </tr>`;
              })
              .join("");

      return `
        <tr>
          <td style="padding:0 0 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d7e0dc;background:#ffffff;">
              <tr>
                <td style="padding:16px 18px;background:linear-gradient(135deg,#f0fdfa 0%,#ffffff 60%);border-bottom:1px solid #e8eeeb;">
                  <p style="margin:0;font-size:16px;font-weight:800;color:#0f1a16;">
                    ${escapeHtml(member.name)}
                  </p>
                  <div style="margin-top:8px;">${traits}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 18px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${taskRows}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  const unassignedBlock =
    unassigned.length === 0
      ? ""
      : `
      <tr>
        <td style="padding:4px 0 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #b7c7c0;background:#fafcfb;">
            <tr>
              <td style="padding:16px 18px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#5a6b64;letter-spacing:0.04em;">
                  미배정
                </p>
                ${unassigned
                  .map(
                    (t) =>
                      `<p style="margin:0 0 6px;font-size:13px;color:#0f1a16;">${VERDICT_EMOJI[t.verdict]} ${escapeHtml(t.name)} <span style="color:#6b7c74;">· ${VERDICT_LABEL[t.verdict]}</span></p>`,
                  )
                  .join("")}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(buildResultEmailSubject(payload.projectInput))}</title>
</head>
<body style="margin:0;padding:0;background:#e7eeea;color:#0f1a16;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e7eeea;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #cfdad4;">
          <tr>
            <td style="padding:28px 28px 20px;background:#0f766e;">
              <p style="margin:0;font-size:12px;letter-spacing:0.14em;font-weight:700;color:#99f6e4;">
                GUARDRAIL
              </p>
              <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;font-weight:800;color:#ffffff;">
                가드레일 · 업무 분배 결과
              </h1>
              <p style="margin:10px 0 0;font-size:13px;color:#ccfbf1;">
                ${escapeHtml(date)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 8px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#0f766e;text-transform:uppercase;">
                Project
              </p>
              <p style="margin:6px 0 0;font-size:18px;font-weight:700;line-height:1.4;color:#0f1a16;">
                ${project}
              </p>
              <p style="margin:10px 0 18px;font-size:13px;line-height:1.55;color:#4a5c54;">
                팀원별 맡은 업무, 신호등 판정, 쓸 AI와 활용 가이드를 정리했습니다.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${memberBlocks}
                ${unassignedBlock}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;padding-top:16px;border-top:1px solid #e8eeeb;font-size:11px;line-height:1.5;color:#8a9a93;">
                본 결과는 기술·업무 참고용이며 법적·규제 자문이 아닙니다. · 가드레일 (Guardrail)
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function downloadResultHtml(
  html: string,
  projectInput: string,
): void {
  const safe = projectInput
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 40) || "결과";
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `가드레일-${safe}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function openMailto(to: string, subject: string, body: string): void {
  const url = `mailto:${to.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}
