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

type SessionContextValue = {
  projectInput: string;
  setProjectInput: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  tasks: TaskItem[];
  setTasks: (v: TaskItem[]) => void;
  members: Member[];
  setMembers: (v: Member[]) => void;
  approvedAi: string[];
  setApprovedAi: (v: string[]) => void;
  guides: GuideItem[];
  setGuides: (v: GuideItem[]) => void;
  assignments: AssignmentMap;
  setAssignments: (v: AssignmentMap) => void;
  assignTask: (taskId: string, memberId: "A" | "B" | "C" | null) => void;
  source: string;
  setSource: (v: string) => void;
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
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [approvedAi, setApprovedAi] = useState<string[]>(["Gemini", "Copilot"]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [source, setSource] = useState("");

  const assignTask = useCallback(
    (taskId: string, memberId: "A" | "B" | "C" | null) => {
      setAssignments((prev) => ({ ...prev, [taskId]: memberId }));
    },
    [],
  );

  const reset = useCallback(() => {
    setProjectInput("");
    setGoal("");
    setTasks([]);
    setMembers(defaultMembers);
    setApprovedAi(["Gemini", "Copilot"]);
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
      tasks,
      setTasks,
      members,
      setMembers,
      approvedAi,
      setApprovedAi,
      guides,
      setGuides,
      assignments,
      setAssignments,
      assignTask,
      source,
      setSource,
      reset,
    }),
    [
      projectInput,
      goal,
      tasks,
      members,
      approvedAi,
      guides,
      assignments,
      assignTask,
      source,
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
