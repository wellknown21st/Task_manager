import { Panel } from "./Ui";
import React from "react";

export default function DashboardCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
        {title}
      </h3>
      {children}
    </Panel>
  );
}
