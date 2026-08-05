import { FormEvent, useEffect, useId, useState } from "react";
import { useSession } from "../lib/session";
import { AI_CATALOG } from "../lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ApprovedAiModal({ open, onClose }: Props) {
  const {
    approvedAi,
    toggleApprovedAi,
    addCustomAi,
    customAiOptions,
  } = useSession();
  const titleId = useId();
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const options = Array.from(
    new Set([...AI_CATALOG, ...customAiOptions, ...approvedAi]),
  );

  function onAdd(e: FormEvent) {
    e.preventDefault();
    addCustomAi(custom);
    setCustom("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md border border-ink-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            <h2
              id={titleId}
              className="font-display text-lg font-bold text-ink-900"
            >
              승인 AI 관리
            </h2>
            <p className="mt-1 text-xs text-ink-700/60">
              켠 AI만 가이드·추천에 사용됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-700 hover:border-accent/40"
          >
            닫기
          </button>
        </div>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto px-5 py-4">
          {options.map((name) => {
            const checked = approvedAi.includes(name);
            return (
              <label
                key={name}
                className="flex cursor-pointer items-center justify-between gap-3 border border-ink-100 bg-ink-50/50 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-ink-900">{name}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleApprovedAi(name)}
                  className="h-4 w-4 accent-accent"
                />
              </label>
            );
          })}
        </div>

        <form
          onSubmit={onAdd}
          className="flex gap-2 border-t border-ink-100 px-5 py-3"
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="AI 이름 추가"
            className="min-w-0 flex-1 border border-ink-200 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            추가
          </button>
        </form>

        <p className="border-t border-ink-100 bg-ink-50/80 px-5 py-3 text-xs leading-relaxed text-ink-700/65">
          회사에서 승인한 AI만 업무 가이드에 사용됩니다.
        </p>
      </div>
    </div>
  );
}
