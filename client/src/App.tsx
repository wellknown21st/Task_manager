import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import ProjectDetail from "./pages/ProjectDetail";
import Signup from "./pages/Signup";

function RequireAuth() {
  const auth = useAuth();
  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Checking session…
      </div>
    );
  }
  if (auth.status !== "authed") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function GuestOnly() {
  const auth = useAuth();
  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }
  if (auth.status === "authed") {
    return <Navigate to="/projects" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
