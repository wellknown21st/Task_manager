import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Btn({
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  children?: ReactNode;
}) {
  const styles =
    variant === "primary"
      ? "bg-accent hover:bg-blue-500 text-white"
      : variant === "danger"
        ? "bg-red-900/80 hover:bg-red-800 text-red-50"
        : "bg-transparent hover:bg-white/10 text-slate-200";
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${styles} ${className}`}
      type="button"
      {...rest}
    >
      {children}
    </button>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-700 bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent ${props.className ?? ""}`}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-slate-700 bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent ${props.className ?? ""}`}
    />
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-card p-5 shadow-xl shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="mb-6 flex gap-2 border-b border-slate-800 pb-px">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            active === t.key
              ? "border-accent text-white"
              : "border-transparent text-muted hover:text-slate-300"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
