import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api";
import { useAuth } from "../AuthContext";
import { Btn, Label, Panel, TextInput } from "../components/Ui";

export default function Signup() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(
          typeof err.details === "object"
            ? "Check your inputs (password min 8 characters)."
            : err.message
        );
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Panel className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            &larr; Home
          </Link>
          <div className="flex bg-black/40 rounded-lg p-1">
            <Link to="/login" className="px-4 py-1.5 text-sm font-medium rounded-md text-muted hover:text-slate-200 transition">Sign In</Link>
            <Link to="/register" className="px-4 py-1.5 text-sm font-medium rounded-md bg-accent text-white shadow">Sign Up</Link>
          </div>
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-muted">
            Join your team&apos;s Task Manager workspace.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? (
            <p className="rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <div>
            <Label>Name</Label>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <TextInput
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <TextInput
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Btn type="submit" className="w-full" variant="primary">
            Sign up
          </Btn>
        </form>
      </Panel>
    </div>
  );
}
