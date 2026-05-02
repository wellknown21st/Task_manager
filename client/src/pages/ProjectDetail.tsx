import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  ApiError,
  ProjectsApi,
  type Dashboard as DashboardType,
  type ProjectDetail as ProjectDetailType,
  type Task,
} from "../api";
import { Btn, Label, Panel, Tabs, TextInput } from "../components/Ui";
import Dashboard from "./Dashboard";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [detail, setDetail] = useState<ProjectDetailType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dash, setDash] = useState<DashboardType | null>(null);
  const [tab, setTab] = useState("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [taskModal, setTaskModal] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!projectId) return;
    setError(null);
    try {
      const [d, tlist, dashData] = await Promise.all([
        ProjectsApi.get(projectId),
        ProjectsApi.tasks.list(projectId),
        ProjectsApi.dashboard(projectId),
      ]);
      setDetail(d);
      setTasks(tlist);
      setDash(dashData);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load project");
    }
  }, [projectId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const isAdmin = detail?.myRole === "ADMIN";

  const memberOptions = useMemo(
    () =>
      detail?.members.map((m) => ({
        id: m.userId,
        label: `${m.user.name}`,
      })) ?? [],
    [detail]
  );

  if (!projectId) return null;

  if (error && !detail) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <Panel>
          <p className="text-red-300">{error}</p>
          <Link to="/projects">
            <Btn className="mt-4">Back to projects</Btn>
          </Link>
        </Panel>
      </div>
    );
  }

  if (!detail) {
    return <div className="px-8 py-12 text-muted">Loading project…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-8 text-sm text-muted">
        <Link className="hover:text-accent" to="/projects">
          Projects
        </Link>
        <span className="px-2">/</span>
        <span className="text-slate-200">{detail.name}</span>
      </nav>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{detail.name}</h1>
          {detail.description ? (
            <p className="mt-2 max-w-2xl text-muted">{detail.description}</p>
          ) : null}
          <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            Role: {detail.myRole}
          </span>
        </div>
        {isAdmin ? (
          <Btn variant="primary" onClick={() => setTaskModal(true)}>
            New task
          </Btn>
        ) : null}
      </header>

      {error ? (
        <p className="mb-6 rounded-lg border border-amber-900/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          {error}
        </p>
      ) : null}

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={
          detail.myRole === "ADMIN"
            ? [
                { key: "dashboard", label: "Dashboard" },
                { key: "tasks", label: "Tasks" },
                { key: "team", label: "Team" },
              ]
            : [
                { key: "dashboard", label: "Dashboard" },
                { key: "tasks", label: "My tasks & board" },
              ]
        }
      />

      {tab === "dashboard" && dash ? (
        <Dashboard dash={dash} />
      ) : null}

      {tab === "tasks" ? (
        <TasksView
          tasks={tasks}
          isAdmin={isAdmin}
          onRefresh={refreshAll}
          projectId={projectId}
          members={memberOptions}
        />
      ) : null}

      {tab === "team" && isAdmin ? (
        <TeamView
          projectId={projectId}
          detail={detail}
          onRefresh={refreshAll}
        />
      ) : null}

      {taskModal && isAdmin ? (
        <TaskModal
          projectId={projectId}
          members={memberOptions}
          onClose={() => setTaskModal(false)}
          onCreated={() => {
            setTaskModal(false);
            refreshAll();
          }}
        />
      ) : null}
    </div>
  );
}


function TasksView({
  projectId,
  tasks,
  isAdmin,
  onRefresh,
  members,
}: {
  projectId: string;
  tasks: Task[];
  isAdmin: boolean;
  onRefresh: () => void;
  members: { id: string; label: string }[];
}) {
  async function patchTask(id: string, patch: Partial<Task>) {
    try {
      await ProjectsApi.tasks.update(projectId, id, {
        status: patch.status,
        priority: patch.priority,
        title: patch.title,
        description: patch.description ?? undefined,
        dueDate:
          patch.dueDate === undefined
            ? undefined
            : patch.dueDate
              ? new Date(patch.dueDate).toISOString()
              : null,
      });
      await onRefresh();
    } catch {
      alert("Could not save task.");
    }
  }

  async function remove(taskId: string) {
    if (!confirm("Delete this task permanently?")) return;
    try {
      await ProjectsApi.tasks.remove(projectId, taskId);
      await onRefresh();
    } catch {
      alert("Could not delete task.");
    }
  }

  async function assignChange(taskId: string, uid: string) {
    try {
      await ProjectsApi.tasks.update(projectId, taskId, {
        assigneeUserId: uid === "" ? null : uid,
      });
      await onRefresh();
    } catch {
      alert("Could not reassign.");
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-black/35 text-muted">
          <tr>
            <th className="p-4 font-medium">Task</th>
            <th className="p-4 font-medium">Assignee</th>
            <th className="p-4 font-medium">Due</th>
            <th className="p-4 font-medium">Priority</th>
            <th className="p-4 font-medium">Status</th>
            {isAdmin ? <th className="p-4 font-medium"></th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="p-6 text-muted">
                No visible tasks yet.
              </td>
            </tr>
          ) : (
            tasks.map((t) => (
              <TaskCard
                key={t.id}
                t={t}
                isAdmin={isAdmin}
                members={members}
                patchTask={patchTask}
                assignChange={assignChange}
                remove={remove}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TeamView({
  projectId,
  detail,
  onRefresh,
}: {
  projectId: string;
  detail: ProjectDetailType;
  onRefresh: () => void;
}) {
  const authUser = useAuth();
  const meId = authUser.status === "authed" ? authUser.user.id : "";
  const [email, setEmail] = useState("");

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ProjectsApi.members.add(projectId, email.trim());
      setEmail("");
      await onRefresh();
    } catch {
      alert("Invite failed — check email belongs to an existing account.");
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      await ProjectsApi.members.remove(projectId, userId);
      await onRefresh();
    } catch {
      alert("Could not remove.");
    }
  }

  return (
    <Panel>
      <form className="mb-10 flex flex-wrap items-end gap-3" onSubmit={invite}>
        <div className="min-w-[200px] flex-1">
          <Label>Add member by email</Label>
          <TextInput
            type="email"
            placeholder="coleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="mt-2 text-[11px] text-muted">
            User must already have signed up — they&apos;ll gain Member access instantly.
          </p>
        </div>
        <Btn type="submit" variant="primary">
          Invite
        </Btn>
      </form>

      <ul className="divide-y divide-slate-800">
        {detail.members.map((m) => (
          <li
            key={m.userId}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div>
              <p className="font-medium">{m.user.name}</p>
              <p className="text-sm text-muted">{m.user.email}</p>
              <span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase">
                {m.role}
              </span>
            </div>
            {m.userId !== meId ? (
              <Btn variant="danger" className="text-xs" onClick={() => removeMember(m.userId)}>
                Remove member
              </Btn>
            ) : (
              <span className="text-xs text-muted">This is you</span>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

