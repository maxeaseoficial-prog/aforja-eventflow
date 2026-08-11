import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  MapPin,
  Radio,
  ShoppingCart,
  Trash2,
  Users,
  Timer,
  Plus,
} from "lucide-react";
import { useState } from "react";

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
import { Input } from "@/components/ui/input";
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

function DateTimeModal({ isOpen, onClose, onSave, initialDate = "", initialTime = "" }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (date: string, time: string) => void;
  initialDate?: string | undefined;
  initialTime?: string | undefined;
}) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-foreground">
      <div className="w-full max-w-md surface-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
            <Timer className="size-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Agendar Evento</h3>
            <p className="text-sm text-muted-foreground">Defina a data e o horário para o cronômetro.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="label-caps text-[11px] text-muted-foreground">Data do Evento</label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="bg-surface border-border-strong h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="label-caps text-[11px] text-muted-foreground">Horário de Início</label>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="bg-surface border-border-strong h-11"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => onSave(date, time)} className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground font-bold">
            Salvar e iniciar contagem
          </Button>
        </div>
      </div>
    </div>
  );
}

function CountdownBlock() {
  const { event, updateEvent } = useForja();
  if (!event) return null;
  const metrics = useForjaMetrics();
  const countdown = useCountdown(event.date);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasDate = !!event.date;
  const eventDateObj = hasDate ? new Date(event.date) : null;

  const handleSave = (date: string, time: string) => {
    if (!date) return;
    const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;
    updateEvent({ date: dateTime });
    setIsModalOpen(false);
  };

  const removeDate = () => {
    if (confirm("Deseja remover a data do evento e parar a contagem?")) {
      updateEvent({ date: "" });
    }
  };

  if (!hasDate) {
    return (
      <section className="surface-card animate-fade-up relative overflow-hidden p-8 shadow-card flex flex-col items-center justify-center text-center py-16">
        <div className="size-16 rounded-full bg-primary-soft flex items-center justify-center text-primary mb-6 animate-pulse">
          <CalendarDays className="size-8" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2">Contagem Regressiva</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Defina a data e o horário do evento para iniciar a contagem regressiva em tempo real.
        </p>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-6 text-lg font-bold rounded-xl gap-3 shadow-lg shadow-primary/20"
        >
          <Plus className="size-5" />
          Registrar data e hora do evento
        </Button>
        <DateTimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      </section>
    );
  }

  const units = [
    { value: countdown.days, label: "DIAS" },
    { value: countdown.hours, label: "HORAS" },
    { value: countdown.minutes, label: "MINUTOS" },
    { value: countdown.seconds, label: "SEGUNDOS" },
  ];

  const displayDate = hasDate && eventDateObj ? eventDateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }) : "";

  const displayTime = hasDate && eventDateObj ? eventDateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }) : "";

  return (
    <section className="surface-card animate-fade-up relative overflow-hidden p-6 shadow-2xl border-primary/10 group">
      {/* Background Ember Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
        style={{ background: "radial-gradient(circle, oklch(0.664 0.207 37.5), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
        style={{ background: "radial-gradient(circle, oklch(0.664 0.207 37.5), transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center justify-center gap-8 py-8 md:py-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-[10px] font-bold tracking-[0.2em] mb-2 uppercase">
            <Radio className="size-3 animate-pulse" />
            Centro de Comando Operacional
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic text-glow">
            {event.name || "A FORJA"}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-muted-foreground font-medium text-sm">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {displayDate}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {displayTime}
            </span>
            {event.venue && (
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {event.venue}
              </span>
            )}
          </div>
        </div>

        {countdown.passed ? (
          <div className="text-center animate-bounce py-6">
             <h3 className="font-display text-5xl md:text-7xl font-black text-primary italic tracking-tighter uppercase">
              O EVENTO COMEÇOU
            </h3>
            <p className="text-muted-foreground mt-4 label-caps tracking-widest">Execução em andamento</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl px-4">
            {units.map((unit, idx) => (
              <div key={unit.label} className="relative flex flex-col items-center">
                <div className="font-display text-6xl md:text-7xl lg:text-8xl font-black tabular-nums tracking-tighter leading-none flex items-center gap-1">
                  {String(unit.value).padStart(2, "0")}
                  {idx < units.length - 1 && (
                    <span className="hidden md:block text-primary/20 absolute -right-6 lg:-right-8 top-0">:</span>
                  )}
                </div>
                <div className="label-caps mt-2 text-xs text-primary/60 tracking-[0.3em] font-bold">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-8">
          <Button 
            asChild
            variant="outline" 
            className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 h-10 px-6 rounded-lg font-bold"
          >
            <Link to="/modo-evento">
              <Radio className="size-4" />
              MODO EVENTO
            </Link>
          </Button>
          
          <div className="h-6 w-px bg-border/50 mx-2" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsModalOpen(true)}
            className="text-muted-foreground hover:text-primary gap-2"
          >
            <Edit className="size-4" />
            Editar
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={removeDate}
            className="text-muted-foreground hover:text-destructive gap-2"
          >
            <Trash2 className="size-4" />
            Remover
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 right-6 flex items-center gap-2">
        <span className="text-[10px] label-caps text-muted-foreground/60">Saúde da Forja</span>
        <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary shadow-[0_0_8px_rgba(255,77,0,0.5)] transition-all duration-1000" 
            style={{ width: `${metrics.health}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-primary">{metrics.health}%</span>
      </div>

      <DateTimeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialDate={event && event.date ? event.date.split('T')[0] : ""}
        initialTime={(event && event.date && event.date.indexOf('T') !== -1) ? event.date.split('T')[1].slice(0, 5) : ""}
      />
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
