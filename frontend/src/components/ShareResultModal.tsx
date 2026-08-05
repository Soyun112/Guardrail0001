import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import {
  buildResultEmailHtml,
  buildResultEmailPlainText,
  buildResultEmailSubject,
  downloadResultHtml,
  openMailto,
  type ResultEmailPayload,
} from "../lib/resultEmail";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTo: string;
  payload: ResultEmailPayload;
};

export function ShareResultModal({
  open,
  onClose,
  defaultTo,
  payload,
}: Props) {
  const titleId = useId();
  const [to, setTo] = useState(defaultTo);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const subject = useMemo(
    () => buildResultEmailSubject(payload.projectInput),
    [payload.projectInput],
  );
  const plain = useMemo(() => buildResultEmailPlainText(payload), [payload]);
  const html = useMemo(() => buildResultEmailHtml(payload), [payload]);

  useEffect(() => {
    if (open) {
      setTo(defaultTo);
      setCopied(false);
      setHint(null);
    }
  }, [open, defaultTo]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function onSend(e: FormEvent) {
    e.preventDefault();
    const recipient = to.trim();
    if (!recipient || !recipient.includes("@")) {
      setHint("받는 사람 이메일을 확인해 주세요.");
      return;
    }
    // mailto URL length limits vary; keep a soft guard.
    if (plain.length > 1800) {
      downloadResultHtml(html, payload.projectInput);
      openMailto(
        recipient,
        subject,
        [
          "가드레일 업무 분배 결과를 공유합니다.",
          "",
          `프로젝트: ${payload.projectInput}`,
          "",
          "내용이 길어 자세한 HTML 보고서를 함께 내려받았습니다.",
          "첨부하거나 브라우저에서 열어 확인해 주세요.",
          "",
          "— 가드레일",
        ].join("\n"),
      );
      setHint("내용이 길어 HTML 보고서를 함께 받았습니다. 메일 앱이 열립니다.");
      return;
    }
    openMailto(recipient, subject, plain);
    setHint("메일 앱이 열립니다. 내용을 확인한 뒤 보내 주세요.");
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setHint("메일 본문을 복사했습니다.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setHint("복사에 실패했습니다. 미리보기에서 직접 선택해 주세요.");
    }
  }

  function onDownload() {
    downloadResultHtml(html, payload.projectInput);
    setHint("예쁜 HTML 보고서를 저장했습니다. 메일에 첨부해 보내세요.");
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col border border-ink-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            <h2
              id={titleId}
              className="font-display text-lg font-bold text-ink-900"
            >
              결과 메일로 보내기
            </h2>
            <p className="mt-1 text-xs text-ink-700/60">
              팀원별 업무·판정·가이드를 정리해 메일 앱으로 엽니다.
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

        <form
          onSubmit={onSend}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="space-y-3 overflow-y-auto px-5 py-4">
            <label className="block text-xs font-semibold text-ink-700/80">
              받는 사람
              <input
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="name@company.com"
                className="mt-1.5 w-full border border-ink-200 bg-ink-50/60 px-3 py-2 text-sm text-ink-900 outline-none focus:border-accent"
              />
            </label>

            <div>
              <p className="text-xs font-semibold text-ink-700/80">제목</p>
              <p className="mt-1 border border-ink-100 bg-ink-50/40 px-3 py-2 text-sm text-ink-800">
                {subject}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-700/80">
                  본문 미리보기
                </p>
                <button
                  type="button"
                  onClick={() => void onCopy()}
                  className="text-[11px] font-medium text-accent-dark hover:underline"
                >
                  {copied ? "복사됨" : "본문 복사"}
                </button>
              </div>
              <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap border border-ink-100 bg-ink-50/40 px-3 py-2 font-sans text-[11px] leading-relaxed text-ink-700/85">
                {plain}
              </pre>
            </div>

            {hint ? (
              <p className="border border-accent/20 bg-accent-soft/60 px-3 py-2 text-xs text-accent-dark">
                {hint}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-ink-100 px-5 py-4">
            <button
              type="button"
              onClick={onDownload}
              className="rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 hover:border-accent/40"
            >
              HTML 보고서 저장
            </button>
            <button
              type="submit"
              className="ml-auto rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              메일 앱으로 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
