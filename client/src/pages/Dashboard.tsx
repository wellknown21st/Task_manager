import { type Dashboard as DashboardType, type TaskStatus } from "../api";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard({ dash }: { dash: DashboardType }) {
  const total = Math.max(
    dash.tasksByStatus.TODO + dash.tasksByStatus.IN_PROGRESS + dash.tasksByStatus.DONE,
    1
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DashboardCard title="Overview">
        <p className="mt-6 text-4xl font-semibold">{dash.totalTasks}</p>
        <p className="text-muted">tasks in scope for you</p>
        <div className="mt-8 flex gap-4">
          <div className="rounded-lg bg-black/40 px-4 py-3">
            <p className="text-xs text-muted">Overdue</p>
            <p className="text-2xl font-semibold text-red-400">{dash.overdueTasks}</p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="By status">
        <ul className="mt-6 space-y-3">
          {(
            ["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]
          ).map((s) => {
            const count = dash.tasksByStatus[s];
            const pct = Math.round((count / total) * 100);
            return (
              <li key={s}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s.replace("_", " ")}</span>
                  <span className="text-muted">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </DashboardCard>

      <DashboardCard className="md:col-span-2" title="Tasks per person">
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dash.tasksPerUser.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-slate-800 bg-black/35 px-4 py-5"
            >
              <p className="truncate text-xs uppercase text-muted">{row.label}</p>
              <p className="mt-2 text-3xl font-semibold">{row.count}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
