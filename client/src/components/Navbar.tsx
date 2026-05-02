import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Btn } from "./Ui";

export default function Navbar() {
  const auth = useAuth();
  if (auth.status !== "authed") return null;
  const profile = auth.user;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            className="text-sm font-semibold tracking-wide text-accent hover:text-blue-300"
            to="/projects"
          >
            Team tasks
          </Link>
          <Link
            className="text-sm text-muted transition hover:text-slate-100"
            to="/projects"
          >
            Projects
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="max-w-[200px] truncate text-xs text-muted sm:max-w-xs">
            {profile.name}{" "}
            <span className="hidden text-muted sm:inline">({profile.email})</span>
          </span>
          <Btn variant="ghost" className="shrink-0 text-xs" onClick={auth.logout}>
            Log out
          </Btn>
        </div>
      </div>
    </header>
  );
}
