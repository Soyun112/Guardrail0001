import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ApprovedAiModal } from "./ApprovedAiModal";
import { Disclaimer } from "./Disclaimer";

const STEPS = [
  { path: "/project", label: "프로젝트" },
  { path: "/decompose", label: "업무도출" },
  { path: "/verdict", label: "판정" },
  { path: "/guide", label: "가이드" },
  { path: "/assign", label: "분배" },
  { path: "/result", label: "결과" },
];

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const { signOut, email, isGuest } = useAuth();
  const [aiOpen, setAiOpen] = useState(false);
  const currentIdx = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight text-accent-dark">
              가드레일
            </p>
            <p className="text-xs text-ink-700/55">팀 AI 배분 워크스페이스</p>
          </div>
          <div className="flex items-center gap-2">
            {email ? (
              <span className="hidden max-w-[12rem] truncate text-xs text-ink-700/70 sm:inline">
                {email}
              </span>
            ) : isGuest ? (
              <span className="hidden text-xs text-ink-700/50 sm:inline">
                둘러보기
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700/80 transition hover:border-accent/40 hover:text-accent-dark"
            >
              <GearIcon />
              승인 AI 관리
            </button>
            <button
              type="button"
              onClick={() => {
                void signOut().then(() => {
                  window.location.href = "/";
                });
              }}
              className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700/80 transition hover:border-accent/40 hover:text-accent-dark"
            >
              로그아웃
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3">
          <ol className="flex min-w-max gap-1">
            {STEPS.map((step, i) => {
              const active = i === currentIdx;
              const done = currentIdx > i;
              return (
                <li key={step.path}>
                  <NavLink
                    to={step.path}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                      active
                        ? "bg-accent text-white"
                        : done
                          ? "bg-accent-soft text-accent-dark"
                          : "text-ink-700/45 hover:bg-ink-100",
                    ].join(" ")}
                  >
                    <span className="opacity-70">{i + 1}</span>
                    {step.label}
                  </NavLink>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <Disclaimer />
      <ApprovedAiModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
