import { useState } from "react";
import { Label, TextInput, TextArea, Btn, Panel } from "./Ui";
import { ProjectsApi, type TaskPriority } from "../api";

export default function TaskModal({
  projectId,
  members,
  onClose,
  onCreated,
}: {
  projectId: string;
  members: { id: string; label: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assignee, setAssignee] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ProjectsApi.tasks.create(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: due ? new Date(due + "T12:00:00").toISOString() : undefined,
        priority,
        assigneeUserId: assignee === "" ? null : assignee,
      });
      onCreated();
    } catch {
      alert("Could not create task.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <Panel className="relative z-50 w-full max-w-lg">
        <h2 className="mb-4 text-lg font-semibold">New task</h2>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label>Title</Label>
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Due date</Label>
              <TextInput type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div>
              <Label>Priority</Label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-surface px-3 py-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Assign to</Label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-surface px-3 py-2 text-sm"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Create task
            </Btn>
          </div>
        </form>
      </Panel>
    </div>
  );
}
