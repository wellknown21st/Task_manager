import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Sidebar() {
  const auth = useAuth();
  return (
    <aside className="w-64 border-r border-slate-800 bg-surface/50 p-6 hidden md:flex flex-col">
      <nav className="space-y-4 text-sm text-muted flex-1">
        <Link className="block transition hover:text-slate-100" to="/projects">
          Projects
        </Link>
      </nav>
      <div className="mt-auto">
        <button
          className="text-sm font-medium text-slate-400 hover:text-red-400 transition"
          onClick={auth.logout}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
