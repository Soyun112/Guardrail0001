import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { useAuth } from "./lib/auth";
import AssignPage from "./pages/AssignPage";
import DecomposePage from "./pages/DecomposePage";
import GuidePage from "./pages/GuidePage";
import LoginPage from "./pages/LoginPage";
import ProjectPage from "./pages/ProjectPage";
import ResultPage from "./pages/ResultPage";
import VerdictPage from "./pages/VerdictPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 text-sm text-ink-700/60">
        불러오는 중…
      </div>
    );
  }
  if (!isAuthed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/decompose" element={<DecomposePage />} />
        <Route path="/verdict" element={<VerdictPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/assign" element={<AssignPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
