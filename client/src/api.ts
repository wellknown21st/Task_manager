export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE =
  import.meta.env.VITE_API_BASE != null && import.meta.env.VITE_API_BASE !== ""
    ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, "")
    : "";

async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. In development, open a second terminal, run `cd server` then `npm run dev` (default port 4000 must match vite.config.ts proxy)."
    );
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: { error?: string; details?: unknown } = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        res.status,
        res.ok ? "Unexpected non-JSON response from server." : text.slice(0, 200) || res.statusText
      );
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof data.error === "string" ? data.error : res.statusText,
      data.details
    );
  }
  return data as T;
}

export type User = { id: string; name: string; email: string; createdAt: string };

export type ProjectRole = "ADMIN" | "MEMBER";

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  myRole: ProjectRole;
  memberCount: number;
  taskCount: number;
  members?: ProjectMember[];
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: User;
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: ProjectMember[];
  myRole: ProjectRole;
};

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeUserId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: User | null;
  createdBy: User | null;
};

export type Dashboard = {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksPerUser: {
    userId: string | null;
    label: string;
    email?: string;
    count: number;
  }[];
  overdueTasks: number;
  role: ProjectRole;
};

export const AuthApi = {
  register(body: { name: string; email: string; password: string }) {
    return api<{ user: User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  login(body: { email: string; password: string }) {
    return api<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  me() {
    return api<User>("/api/auth/me");
  },
};

export const ProjectsApi = {
  list() {
    return api<ProjectListItem[]>("/api/projects");
  },
  create(body: { name: string; description?: string }) {
    return api<ProjectListItem>("/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  get(id: string) {
    return api<ProjectDetail>(`/api/projects/${id}`);
  },
  members: {
    add(projectId: string, email: string) {
      return api<ProjectMember>(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    remove(projectId: string, userId: string) {
      return api<void>(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
    },
  },
  tasks: {
    list(projectId: string) {
      return api<Task[]>(`/api/projects/${projectId}/tasks`);
    },
    create(
      projectId: string,
      body: Partial<Pick<Task, "title" | "description" | "dueDate">> & {
        title: string;
        priority?: TaskPriority;
        status?: TaskStatus;
        assigneeUserId?: string | null;
      }
    ) {
      return api<Task>(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    update(
      projectId: string,
      taskId: string,
      body: Partial<{
        title: string;
        description: string | null;
        dueDate: string | null;
        priority: TaskPriority;
        status: TaskStatus;
        assigneeUserId: string | null;
      }>
    ) {
      return api<Task>(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    remove(projectId: string, taskId: string) {
      return api<void>(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });
    },
  },
  dashboard(projectId: string) {
    return api<Dashboard>(`/api/projects/${projectId}/dashboard`);
  },
};
