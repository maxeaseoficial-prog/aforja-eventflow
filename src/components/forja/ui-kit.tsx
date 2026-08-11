import { Check, MessageCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  PURCHASE_STATUS_LABEL,
  TASK_STATUS_LABEL,
  whatsappLink,
  type Priority,
  type PurchaseStatus,
  type TaskStatus,
} from "@/lib/forja-data";

/* ------------------------------- Badges ------------------------------- */

const badgeBase =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

const dot = "size-1.5 rounded-full";

const statusTone: Record<TaskStatus, string> = {
  "nao-iniciado": "border-border bg-secondary text-muted-foreground",
  "em-andamento": "border-primary/30 bg-primary-soft text-primary",
  aguardando: "border-warning/25 bg-warning/10 text-warning",
  concluido: "border-success/25 bg-success/10 text-success",
  problema: "border-destructive/30 bg-destructive/10 text-destructive",
};

const statusDot: Record<TaskStatus, string> = {
  "nao-iniciado": "bg-muted-foreground",
  "em-andamento": "bg-primary",
  aguardando: "bg-warning",
  concluido: "bg-success",
  problema: "bg-destructive",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span className={cn(badgeBase, statusTone[status], className)}>
      <span className={cn(dot, statusDot[status])} />
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}

const priorityTone: Record<Priority, string> = {
  baixa: "border-border bg-secondary text-muted-foreground",
  media: "border-info/25 bg-info/10 text-info",
  alta: "border-warning/25 bg-warning/10 text-warning",
  urgente: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return <span className={cn(badgeBase, priorityTone[priority], className)}>{PRIORITY_LABEL[priority]}</span>;
}

const purchaseTone: Record<PurchaseStatus, string> = {
  "precisa-comprar": "border-destructive/30 bg-destructive/10 text-destructive",
  cotando: "border-warning/25 bg-warning/10 text-warning",
  comprado: "border-primary/30 bg-primary-soft text-primary",
  recebido: "border-success/25 bg-success/10 text-success",
  cancelado: "border-border bg-secondary text-muted-foreground",
};

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  return <span className={cn(badgeBase, purchaseTone[status])}>{PURCHASE_STATUS_LABEL[status]}</span>;
}

export function PersonStatusBadge({ status, className }: { status: "confirmado" | "pendente" | "indefinido"; className?: string }) {
  const tone =
    status === "confirmado"
      ? "border-success/25 bg-success/10 text-success"
      : status === "pendente"
        ? "border-warning/25 bg-warning/10 text-warning"
        : "border-destructive/30 bg-destructive/10 text-destructive";
  const label =
    status === "confirmado" ? "Confirmado" : status === "pendente" ? "Pendente" : "Indefinido";
  return <span className={cn(badgeBase, tone, className)}>{label}</span>;
}

/* ------------------------------ Progress ------------------------------ */

export function ProgressBar({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "success" | "warning";
  className?: string;
}) {
  const bar =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-primary";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", bar)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function CategoryProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display font-semibold tabular-nums">{value}%</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

/* ------------------------------- Layout ------------------------------- */

export function Panel({
  title,
  action,
  description,
  className,
  children,
}: {
  title?: string | undefined;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section className={cn("surface-card animate-fade-up p-5 shadow-card sm:p-6", className)}>
      {(title || action) && (
        <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            {title && <h2 className="label-caps">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function MetricCard({
  value,
  label,
  hint,
  icon: Icon,
  tone = "default",
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const toneText =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
        : tone === "warning"
          ? "text-warning"
          : tone === "destructive"
            ? "text-destructive"
            : "text-foreground";
  return (
    <div className="surface-card surface-card-hover animate-fade-up p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between">
        <span className="label-caps truncate">{label}</span>
        {Icon && <Icon className={cn("size-4 shrink-0", toneText)} />}
      </div>
      <p className={cn("mt-3 font-display text-3xl font-bold tabular-nums", toneText)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AlertCard({
  label,
  detail,
  tone = "warning",
  onClick,
}: {
  label: string;
  detail?: string;
  tone?: "warning" | "destructive" | "info";
  onClick?: () => void;
}) {
  const ring =
    tone === "destructive"
      ? "border-destructive/25 hover:border-destructive/50"
      : tone === "info"
        ? "border-info/25 hover:border-info/50"
        : "border-warning/25 hover:border-warning/50";
  const dotTone =
    tone === "destructive" ? "bg-destructive" : tone === "info" ? "bg-info" : "bg-warning";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "surface-card surface-card-hover flex w-full items-center gap-3 border p-3.5 text-left transition-transform active:scale-[0.99]",
        ring,
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", dotTone)} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{label}</span>
        {detail && <span className="block truncate text-xs text-muted-foreground">{detail}</span>}
      </span>
    </button>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid size-11 place-items-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ----------------------------- Checklists ----------------------------- */

export function ChecklistItem({
  label,
  done,
  onToggle,
  hint,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-200 hover:bg-card-hover"
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-md border transition-all duration-200",
          done
            ? "border-success bg-success/15 text-success"
            : "border-border-strong text-transparent group-hover:border-primary/50",
        )}
      >
        <Check className={cn("size-3.5 transition-transform duration-200", done ? "scale-100" : "scale-0")} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm transition-colors duration-200",
            done ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {label}
        </span>
        {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
    </button>
  );
}

export function WhatsappButton({ number, label = "WhatsApp" }: { number: string; label?: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 hover:border-success/40 hover:text-success"
    >
      <MessageCircle className="size-3.5" />
      {label}
    </a>
  );
}

export function Avatar({ name, size = "md" }: { name: string | null; size?: "sm" | "md" | "lg" }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
  const dims = size === "sm" ? "size-7 text-[10px]" : size === "lg" ? "size-12 text-sm" : "size-9 text-xs";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-border bg-secondary font-display font-bold text-muted-foreground",
        dims,
        name && "border-primary/25 bg-primary-soft text-primary",
      )}
    >
      {initials}
    </span>
  );
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{value}</span>
    </div>
  );
}
