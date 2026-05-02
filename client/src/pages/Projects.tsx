import { useCallback, useEffect, useState } from "react";
import { ApiError, type ProjectListItem, ProjectsApi } from "../api";
import { useAuth } from "../AuthContext";
import { Btn, Label, Panel, TextArea, TextInput } from "../components/Ui";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const auth = useAuth();
  const [items, setItems] = useState<ProjectListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      const list = await ProjectsApi.list();
      setItems(list);
    } catch (e) {
      setItems([]);
      setError(e instanceof ApiError ? e.message : "Failed to load projects");
    }
  }, []);

  useEffect(() => {
    if (auth.status === "authed") load();
  }, [auth.status, load]);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    try {
      await ProjectsApi.create({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      setCreating(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create project");
    }
  }

  if (auth.status !== "authed") return null;

  const profile = auth.user;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-muted">
            Signed in as <span className="text-slate-200">{profile.email}</span>
          </p>
        </div>
        <Btn variant="ghost" onClick={() => setCreating(true)}>
          New project
        </Btn>
      </header>

      {error ? (
        <p className="mb-6 rounded-lg border border-red-900/70 bg-red-950/60 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      {creating ? (
        <Panel className="mb-8 border-accent/40">
          <h2 className="mb-4 text-lg font-medium">Create project</h2>
          <form className="space-y-4" onSubmit={submitCreate}>
            <div>
              <Label>Name</Label>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Quarterly launch"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Btn type="submit" variant="primary">
                Create
              </Btn>
              <Btn type="button" variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Btn>
            </div>
          </form>
        </Panel>
      ) : null}

      {items === null ? (
        <p className="text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <Panel>
          <p className="text-muted">No projects yet. Create one to get started.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
