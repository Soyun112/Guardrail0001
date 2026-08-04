import type { Verdict } from "../lib/types";
import { VERDICT_EMOJI, VERDICT_LABEL } from "../lib/types";

const STYLES: Record<Verdict, string> = {
  green: "bg-emerald-50 text-signal-green border-emerald-200",
  amber: "bg-amber-50 text-signal-amber border-amber-200",
  red: "bg-rose-50 text-signal-red border-rose-200",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${STYLES[verdict]}`}
    >
      <span>{VERDICT_EMOJI[verdict]}</span>
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
