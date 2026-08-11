import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, KanbanSquare, List, Plus, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NewTaskSheet } from "@/components/forja/NewTaskSheet";
import { useForja } from "@/components/forja/store";
import {
  Avatar,
  ChecklistItem,
  EmptyState,
  Panel,
  PriorityBadge,
  StatusBadge,
} from "@/components/forja/ui-kit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  KANBAN_COLUMNS,
  PRIORITY_LABEL,
  TASK_CATEGORIES,
  TASK_STATUS_LABEL,
  formatDate,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/lib/forja-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — FORJA Event Command Center" },
      { name: "description", content: "Lista e kanban de todas as tarefas da organização do evento A Forja." },
      { property: "og:title", content: "Tarefas — FORJA" },
      { property: "og:description", content: "Prazos, responsáveis, prioridades e status em um só lugar." },
    ],
  }),
  component: TasksPage,
});

type QuickFilter = "todas" | "hoje" | "semana" | "atrasadas" | "concluidas";

function TasksPage() {
  const { tasks, updateTask, removeTask, moveTask, responsibles, clearTasks } = useForja();
  const [view, setView] = useState<"lista" | "kanban">("lista");
  const [quick, setQuick] = useState<QuickFilter>("todas");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("todos");
  const [category, setCategory] = useState("todas");
  const [priority, setPriority] = useState("todas");
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const owners = Array.from(new Set(tasks.map((t) => t.owner)));

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const parse = (iso: string) => new Date(`${iso}T12:00:00`);

    return tasks.filter((task) => {
      if (search && !`${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (owner !== "todos" && task.owner !== owner) return false;
      if (category !== "todas" && task.category !== category) return false;
      if (priority !== "todas" && task.priority !== priority) return false;
      const due = parse(task.dueDate);
      if (quick === "hoje") return due.toDateString() === new Date().toDateString();
      if (quick === "semana") return due >= today && due <= weekEnd;
      if (quick === "atrasadas") return task.status !== "concluido" && due < today;
      if (quick === "concluidas") return task.status === "concluido";
      return true;
    });
  }, [tasks, search, owner, category, priority, quick]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todas", "Todas"],
              ["hoje", "Hoje"],
              ["semana", "Esta semana"],
              ["atrasadas", "Atrasadas"],
              ["concluidas", "Concluídas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setQuick(value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                quick === value
                  ? "border-primary/30 bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView("lista")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === "lista" ? "bg-primary-soft text-primary" : "text-muted-foreground",
              )}
            >
              <List className="size-3.5" /> Lista
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === "kanban" ? "bg-primary-soft text-primary" : "text-muted-foreground",
              )}
            >
              <KanbanSquare className="size-3.5" /> Kanban
            </button>
          </div>
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => {
                  if (confirm("Deseja apagar todas as tarefas?")) clearTasks();
                }}
              >
                <XCircle className="size-4" /> Apagar todas
              </Button>
            )}
            <Button size="sm" className="gap-1.5" onClick={() => setNewOpen(true)}>
              <Plus className="size-4" /> Nova tarefa
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Buscar tarefa..."
          value={search}
          maxLength={80}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger>
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os responsáveis</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {TASK_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as prioridades</SelectItem>
            {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma tarefa encontrada"
          description="Organize a Forja adicionando sua primeira tarefa deste filtro."
          action={<Button onClick={() => setNewOpen(true)}>+ Criar tarefa</Button>}
        />
      ) : view === "lista" ? (
        <Panel>
          <ul className="divide-y divide-border">
            {filtered.map((task) => (
              <li key={task.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label="Alternar conclusão"
                    onClick={() => {
                      const done = task.status === "concluido";
                      updateTask(task.id, { status: done ? "em-andamento" : "concluido" });
                      if (!done) toast.success("Tarefa concluída", { description: task.title });
                    }}
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-all duration-200",
                      task.status === "concluido"
                        ? "border-success bg-success/15 text-success"
                        : "border-border-strong hover:border-primary/60",
                    )}
                  >
                    <span className={cn("size-2 rounded-sm bg-success transition-transform duration-200", task.status === "concluido" ? "scale-100" : "scale-0")} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === task.id ? null : task.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      className={cn(
                        "truncate text-sm font-medium transition-colors duration-200",
                        task.status === "concluido" && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5">
                        {task.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar name={task.owner} size="sm" /> {task.owner}
                      </span>
                      <span>· {formatDate(task.dueDate)}</span>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={task.priority} className="hidden sm:inline-flex" />
                    <Select
                      value={task.status}
                      onValueChange={(v) => updateTask(task.id, { status: v as TaskStatus })}
                    >
                      <SelectTrigger className="h-8 w-auto min-w-32 border-border bg-card text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TASK_STATUS_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      aria-label="Excluir tarefa"
                      onClick={() => setDeleting(task)}
                      className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {expanded === task.id && (
                  <div className="animate-fade-up mt-3 ml-8 space-y-3 rounded-lg border border-border bg-surface p-4">
                    <p className="text-sm text-muted-foreground">
                      {task.description || "Sem descrição registrada."}
                    </p>
                    <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                      <span>Criada em {formatDate(task.createdAt)}</span>
                      <span>WhatsApp: {task.ownerWhatsapp.replace(/^55/, "") || "—"}</span>
                      <span>Prioridade: {PRIORITY_LABEL[task.priority]}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="label-caps">Prazo</p>
                        <Input
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="label-caps">Responsável</p>
                        <Select
                          value={task.owner}
                          onValueChange={(v) =>
                            updateTask(task.id, {
                              owner: v,
                              ownerWhatsapp: responsibles.find((r) => r.name === v)?.whatsapp ?? "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              new Set([...owners, ...responsibles.filter((r) => r.name).map((r) => r.name!)]),
                            ).map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="label-caps">Prioridade</p>
                        <Select
                          value={task.priority}
                          onValueChange={(v) => updateTask(task.id, { priority: v as Priority })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {task.checklist.length > 0 && (
                      <div>
                        <p className="label-caps mb-1">Checklist interno</p>
                        {task.checklist.map((item) => (
                          <ChecklistItem
                            key={item.id}
                            label={item.label}
                            done={item.done}
                            onToggle={() =>
                              updateTask(task.id, {
                                checklist: task.checklist.map((c) =>
                                  c.id === item.id ? { ...c, done: !c.done } : c,
                                ),
                              })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <div className="forja-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {KANBAN_COLUMNS.map((column) => {
            const columnTasks = filtered.filter((t) => t.status === column);
            return (
              <div
                key={column}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragging) {
                    moveTask(dragging, column);
                    toast.success(`Movida para ${TASK_STATUS_LABEL[column]}`);
                    setDragging(null);
                  }
                }}
                className="w-72 shrink-0 rounded-xl border border-border bg-surface/60 p-3 transition-colors duration-200"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <StatusBadge status={column} />
                  <span className="text-xs text-muted-foreground tabular-nums">{columnTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragging(task.id)}
                      onDragEnd={() => setDragging(null)}
                      className={cn(
                        "surface-card surface-card-hover animate-fade-up cursor-grab p-3 active:cursor-grabbing",
                        dragging === task.id && "opacity-50",
                      )}
                    >
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5">
                          {task.category}
                        </span>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Avatar name={task.owner} size="sm" /> {task.owner}
                        </span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </article>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      Arraste tarefas para cá
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewTaskSheet open={newOpen} onOpenChange={setNewOpen} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="bg-surface">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não poderá ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) removeTask(deleting.id);
                toast.success("Tarefa excluída");
                setDeleting(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
