import { Link } from "react-router-dom";
import { Panel } from "./Ui";
import { type ProjectListItem } from "../api";

export default function ProjectCard({ p }: { p: ProjectListItem }) {
  return (
    <Link to={`/projects/${p.id}`}>
      <Panel className="h-full cursor-pointer transition hover:border-accent/50 hover:bg-[#222d3f]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
            {p.myRole}
          </span>
        </div>
        {p.description ? (
          <p className="line-clamp-2 text-sm text-muted">{p.description}</p>
        ) : null}
        <div className="mt-6 flex gap-6 text-xs text-muted">
          <span>{p.memberCount} members</span>
          <span>{p.taskCount} tasks</span>
        </div>
      </Panel>
    </Link>
  );
}
