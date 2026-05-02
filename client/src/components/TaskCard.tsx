import { type Task, type TaskPriority, type TaskStatus } from "../api";
import { Btn } from "./Ui";

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-slate-700/80 text-slate-200",
  MEDIUM: "bg-amber-900/60 text-amber-100",
  HIGH: "bg-red-950/70 text-red-100",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TaskCard({
  t,
  isAdmin,
  members,
  patchTask,
  assignChange,
  remove,
}: {
  t: Task;
  isAdmin: boolean;
  members: { id: string; label: string }[];
  patchTask: (id: string, patch: Partial<Task>) => void;
  assignChange: (taskId: string, uid: string) => void;
  remove: (taskId: string) => void;
}) {
  return (
    <tr className="bg-card/70 hover:bg-card">
      <td className="p-4 align-top">
        <p className="font-medium">{t.title}</p>
        {t.description ? (
          <p className="mt-1 max-w-xs text-xs text-muted line-clamp-2">
            {t.description}
          </p>
        ) : null}
      </td>
      <td className="p-4 align-top text-xs">
        {isAdmin ? (
          <select
            className="max-w-[200px] rounded border border-slate-700 bg-surface px-2 py-1"
            value={t.assigneeUserId ?? ""}
            onChange={(e) => assignChange(t.id, e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        ) : (
          <span>{t.assignee?.name ?? (t.assigneeUserId ? "—" : "Unassigned")}</span>
        )}
      </td>
      <td className="p-4 align-top text-muted">
        {formatDate(t.dueDate)}
      </td>
      <td className="p-4 align-top">
        <select
          className={`rounded border border-transparent px-2 py-1 text-xs font-semibold ${priorityStyles[t.priority]}`}
          value={t.priority}
          onChange={(e) =>
            patchTask(t.id, { priority: e.target.value as TaskPriority })
          }
        >
          {(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </td>
      <td className="p-4 align-top">
        <select
          className="rounded border border-slate-700 bg-surface px-2 py-1 text-xs uppercase"
          value={t.status}
          onChange={(e) =>
            patchTask(t.id, { status: e.target.value as TaskStatus })
          }
        >
          {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </td>
      {isAdmin ? (
        <td className="p-4 align-top text-right">
          <Btn variant="danger" className="text-xs" onClick={() => remove(t.id)}>
            Delete
          </Btn>
        </td>
      ) : null}
    </tr>
  );
}
