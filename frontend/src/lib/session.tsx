import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AssignmentMap,
  GuideItem,
  Member,
  TaskItem,
} from "./types";
import { DEFAULT_APPROVED_AI, clampRecommendedAi } from "./types";

type SessionContextValue = {
  projectInput: string;
  setProjectInput: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  projectId: string | null;
  setProjectId: (v: string | null) => void;
  tasks: TaskItem[];
  setTasks: (v: TaskItem[]) => void;
  members: Member[];
  setMembers: (v: Member[]) => void;
  approvedAi: string[];
  setApprovedAi: (v: string[]) => void;
  toggleApprovedAi: (name: string) => void;
  addCustomAi: (name: string) => void;
  customAiOptions: string[];
  guides: GuideItem[];
  setGuides: (v: GuideItem[]) => void;
  assignments: AssignmentMap;
  setAssignments: (v: AssignmentMap) => void;
  assignTask: (taskId: string, memberId: "A" | "B" | "C" | null) => void;
  source: string;
  setSource: (v: string) => void;
  applyApprovedAiToResults: (approved: string[]) => void;
  reset: () => void;
};

const defaultMembers: Member[] = [
  {
    id: "A",
    name: "팀원 A",
    traits: ["꼼꼼", "분석형"],
    blurb: "데이터·근거를 챙기는 타입",
  },
  {
    id: "B",
    name: "팀원 B",
    traits: ["창의", "기획형"],
    blurb: "아이디어와 스토리를 만드는 타입",
  },
  {
    id: "C",
    name: "팀원 C",
    traits: ["빠름", "실행형"],
    blurb: "빠르게 결과물을 밀어내는 타입",
  },
];

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [projectInput, setProjectInput] = useState("");
  const [goal, setGoal] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [approvedAi, setApprovedAi] = useState<string[]>([...DEFAULT_APPROVED_AI]);
  const [customAiOptions, setCustomAiOptions] = useState<string[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [source, setSource] = useState("");

  const applyApprovedAiToResults = useCallback((approved: string[]) => {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        recommended_ai: clampRecommendedAi(t.recommended_ai, approved),
      })),
    );
    // Clear guides so Guide page regenerates within the new approved list.
    setGuides([]);
  }, []);

  const toggleApprovedAi = useCallback(
    (name: string) => {
      setApprovedAi((prev) => {
        const exists = prev.includes(name);
        if (exists) {
          if (prev.length <= 1) return prev;
          const next = prev.filter((x) => x !== name);
          applyApprovedAiToResults(next);
          return next;
        }
        const next = [...prev, name];
        applyApprovedAiToResults(next);
        return next;
      });
    },
    [applyApprovedAiToResults],
  );

  const addCustomAi = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setCustomAiOptions((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed],
      );
      setApprovedAi((prev) => {
        if (prev.includes(trimmed)) return prev;
        const next = [...prev, trimmed];
        applyApprovedAiToResults(next);
        return next;
      });
    },
    [applyApprovedAiToResults],
  );

  const assignTask = useCallback(
    (taskId: string, memberId: "A" | "B" | "C" | null) => {
      setAssignments((prev) => ({ ...prev, [taskId]: memberId }));
    },
    [],
  );

  const reset = useCallback(() => {
    setProjectInput("");
    setGoal("");
    setProjectId(null);
    setTasks([]);
    setMembers(defaultMembers);
    setApprovedAi([...DEFAULT_APPROVED_AI]);
    setCustomAiOptions([]);
    setGuides([]);
    setAssignments({});
    setSource("");
  }, []);

  const value = useMemo(
    () => ({
      projectInput,
      setProjectInput,
      goal,
      setGoal,
      projectId,
      setProjectId,
      tasks,
      setTasks,
      members,
      setMembers,
      approvedAi,
      setApprovedAi,
      toggleApprovedAi,
      addCustomAi,
      customAiOptions,
      guides,
      setGuides,
      assignments,
      setAssignments,
      assignTask,
      source,
      setSource,
      applyApprovedAiToResults,
      reset,
    }),
    [
      projectInput,
      goal,
      projectId,
      tasks,
      members,
      approvedAi,
      toggleApprovedAi,
      addCustomAi,
      customAiOptions,
      guides,
      assignments,
      assignTask,
      source,
      applyApprovedAiToResults,
      reset,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
