import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  ShoppingCart,
  Users,
} from "lucide-react";

import { useForja, useForjaMetrics } from "@/components/forja/store";
import {
  AlertCard,
  Avatar,
  CategoryProgress,
  ChecklistItem,
  MetricCard,
  Panel,
  PriorityBadge,
  ProgressBar,
  StatusBadge,
} from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { brl, formatDate } from "@/lib/forja-data";

export const Route = createFileRoute("/_shell/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FORJA Event Command Center" },
      {
        name: "description",
        content:
          "Centro de comando da Forja: contagem regressiva, progresso por área, alertas e próximas tarefas.",
      },
      { property: "og:title", content: "Dashboard — FORJA Event Command Center" },
      {
        property: "og:description",
        content: "Controle total da organização do evento A Forja em um único painel.",
      },
    ],
  }),
  component: Dashboard,
});

function CountdownBlock() {
  const { event } = useForja();
  const metrics = useForjaMetrics();
  const countdown = useCountdown(event.date);
  const eventDate = new Date(event.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const units = [
    { value: countdown.days, label: "DIAS" },
    { value: countdown.hours, label: "HORAS" },
    { value: countdown.minutes, label: "MINUTOS" },
  ];

  return (
    <section className="surface-card animate-fade-up relative overflow-hidden p-6 shadow-card sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.664 0.207 37.5 / 0.16), transparent 65%)" }}
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="label-caps text-primary">{event.edition}</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {event.name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {eventDate} · {new Date(event.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {event.venue}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary-soft">
              <Link to="/modo-evento">
                <Radio className="size-4" />
                MODO EVENTO
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Saúde da Forja:{" "}
              <strong className="font-display text-foreground">
                {metrics.health >= 85 ? "Excelente" : metrics.health >= 65 ? "Boa" : "Atenção"} {metrics.health}%
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="rounded-xl border border-border bg-surface px-4 py-4 text-center sm:px-6"
            >
              <p className="font-display text-3xl font-extrabold text-primary tabular-nums sm:text-4xl">
                {String(unit.value).padStart(2, "0")}
              </p>
              <p className="label-caps mt-1 text-[10px]">{unit.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const { tasks, opening, toggleGroupItem, updateTask, event } = useForja();
  const metrics = useForjaMetrics();

  const upcoming = [...tasks]
    .filter((t) => t.status !== "concluido")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  const openingDone = opening.items.filter((i) => i.done).length;

  return (
    <div className="space-y-6">
      <CountdownBlock />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard value={metrics.total} label="Tarefas" hint="Total cadastrado" />
        <MetricCard
          value={metrics.done}
          label="Concluídas"
          tone="success"
          icon={CheckCircle2}
          hint={`${metrics.progress}% do evento organizado`}
        />
        <MetricCard value={metrics.pending} label="Pendentes" tone="warning" icon={Clock} />
        <MetricCard value={metrics.late.length} label="Atrasadas" tone="destructive" icon={AlertTriangle} />
        <MetricCard
          value={metrics.pendingPurchases.length}
          label="Compras pendentes"
          tone="primary"
          icon={ShoppingCart}
        />
        <MetricCard
          value={metrics.teamSize}
          label="Pessoas na equipe"
          icon={Users}
          hint={`${metrics.confirmedTeam} confirmadas`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Progresso da Forja" className="xl:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-4xl font-extrabold text-primary tabular-nums">{metrics.progress}%</p>
            <p className="text-sm text-muted-foreground">
              {metrics.done} de {metrics.total} tarefas concluídas
            </p>
          </div>
          <ProgressBar value={metrics.progress} className="mt-4 h-2" />

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {metrics.categories.map((category) => (
              <CategoryProgress key={category.label} label={category.label} value={category.value} />
            ))}
          </div>
        </Panel>

        <Panel title="Atenção necessária" description="Itens que travam a organização">
          <div className="space-y-2.5">
            {metrics.late.length > 0 && (
              <AlertCard tone="destructive" label={`${metrics.late.length} tarefas atrasadas`} detail="Ver em Tarefas" />
            )}
            {metrics.purchasesWithoutOwner.length > 0 && (
              <AlertCard
                label={`${metrics.purchasesWithoutOwner.length} compras sem responsável`}
                detail="Ver em Compras"
              />
            )}
            {metrics.unconfirmedSpeakers.length > 0 && (
              <AlertCard
                label={`${metrics.unconfirmedSpeakers.length} palestrante(s) não confirmado(s)`}
                detail="Ver em Palestrantes"
              />
            )}
            {metrics.dueToday.length > 0 && (
              <AlertCard tone="info" label={`${metrics.dueToday.length} tarefas vencem hoje`} />
            )}
            {metrics.undefinedAreas.length > 0 && (
              <AlertCard
                tone="destructive"
                label={`${metrics.undefinedAreas.length} áreas sem responsável`}
                detail={metrics.undefinedAreas.map((a) => a.area).join(", ")}
              />
            )}
            {metrics.late.length === 0 &&
              metrics.undefinedAreas.length === 0 &&
              metrics.unconfirmedSpeakers.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Nenhum alerta ativo.</p>
              )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Próximas tarefas"
          className="xl:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/tarefas">Ver todas</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {upcoming.map((task) => (
              <li key={task.id} className="flex items-start gap-3 py-3 first:pt-0">
                <button
                  type="button"
                  aria-label="Concluir tarefa"
                  onClick={() => updateTask(task.id, { status: "concluido" })}
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-border-strong transition-colors duration-200 hover:border-success hover:bg-success/10"
                >
                  <CheckCircle2 className="size-3.5 text-transparent transition-colors hover:text-success" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5">{task.category}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={task.owner} size="sm" />
                      {task.owner}
                    </span>
                    <span>· {formatDate(task.dueDate)}</span>
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Checklist de abertura"
          description={`${openingDone} / ${opening.items.length} concluídos`}
        >
          <ProgressBar
            value={(openingDone / opening.items.length) * 100}
            tone="success"
            className="mb-4"
          />
          <div className="forja-scroll max-h-80 space-y-0.5 overflow-y-auto">
            {opening.items.map((item) => (
              <ChecklistItem
                key={item.id}
                label={item.label}
                done={item.done}
                onToggle={() => toggleGroupItem("opening", item.id)}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Dados do evento">
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="label-caps">Local</p>
            <p className="mt-1">{event.venue}</p>
            <p className="text-muted-foreground">{event.address}</p>
          </div>
          <div>
            <p className="label-caps">Orçamento</p>
            <p className="mt-1 font-display text-lg font-bold">{brl(event.budget)}</p>
            <p className="text-muted-foreground">Gasto: {brl(metrics.spent)}</p>
          </div>
          <div>
            <p className="label-caps">Convidados previstos</p>
            <p className="mt-1 font-display text-lg font-bold">{event.expectedGuests}</p>
          </div>
          <div>
            <p className="label-caps">Portas abrem</p>
            <p className="mt-1 font-display text-lg font-bold">{event.doorsAt}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
