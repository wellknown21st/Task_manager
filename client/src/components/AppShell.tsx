import { Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/** Global chrome for every authenticated route. */
export default function AppShell() {
  const auth = useAuth();
  // Rendered only under `RequireAuth`, but keeps TypeScript happy.
  if (auth.status !== "authed") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
