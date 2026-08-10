import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, LifeBuoy, Mic, Radio } from "lucide-react";
import { useState } from "react";

import { useForja } from "@/components/forja/store";
import { ChecklistItem, ProgressBar, WhatsappButton } from "@/components/forja/ui-kit";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/modo-evento")({
  head: () => ({
    meta: [
      { title: "Modo Evento — FORJA Event Command Center" },
      { name: "description", content: "Painel de execução ao vivo da Forja: agora, próximo, checklist de abertura e emergências." },
      { property: "og:title", content: "Modo Evento — FORJA" },
      { property: "og:description", content: "Alto contraste, foco total no que está acontecendo agora." },
    ],
  }),
  component: EventModePage,
});

function EventModePage() {
  const { event, schedule, opening, contingencies, staff, updateScheduleItem, toggleGroupItem } = useForja();
  const countdown = useCountdown(event.date);
  const [tab, setTab] = useState<"abertura" | "emergencia" | "equipe">("abertura");

  const currentIndex = Math.max(
    0,
    schedule.findIndex((item: { status: string }) => item.status !== "concluido"),
  );
  const current = schedule[currentIndex];
  const next = schedule[currentIndex + 1];
  const openDone = opening.items.filter((i) => i.done).length;
  const openPct = Math.round((openDone / opening.items.length) * 100);

  return (
    <div className="min-h-screen bg-background px-4 py-5 sm:px-8">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Link
          to="/"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Voltar ao painel"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <p className="label-caps flex items-center gap-1.5 text-primary">
            <Radio className="size-3.5 animate-pulse" /> Modo Evento
          </p>
          <h1 className="truncate font-display text-xl font-black tracking-tight sm:text-2xl">{event.name}</h1>
        </div>
        <span className="shrink-0 rounded-xl border border-primary/30 bg-primary-soft px-3 py-1.5 font-display text-sm font-bold text-primary tabular-nums">
          {countdown.passed ? "AO VIVO" : `${countdown.days}d ${countdown.hours}h`}
        </span>
      </header>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="animate-fade-up rounded-2xl border border-primary/40 bg-primary-soft p-6 shadow-glow">
          <p className="label-caps text-primary">Acontecendo agora</p>
          {current ? (
            <>
              <p className="mt-2 font-display text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
                {current.time}
              </p>
              <h2 className="mt-2 font-display text-xl font-bold">{current.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {current.owner} · {current.duration} · {current.place}
              </p>
              <button
                type="button"
                onClick={() => updateScheduleItem(current.id, { status: "concluido" })}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground transition-transform duration-200 hover:brightness-110 active:scale-[0.98]"
              >
                Concluir e avançar
              </button>
            </>
          ) : (
            <p className="mt-3 font-display text-2xl font-bold">Programação concluída 🎉</p>
          )}
        </div>

        <div className="surface-card animate-fade-up p-6">
          <p className="label-caps">A seguir</p>
          {next ? (
            <>
              <p className="mt-2 font-display text-3xl font-black tabular-nums">{next.time}</p>
              <h2 className="mt-2 font-display text-lg font-bold">{next.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {next.owner} · {next.duration}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma etapa pendente.</p>
          )}

          <div className="mt-5 space-y-2 border-t border-border pt-4">
            <p className="label-caps flex items-center gap-1.5">
              <Clock className="size-3.5" /> Próximas etapas
            </p>
            {schedule.slice(currentIndex + 2, currentIndex + 6).map((item) => (
              <p key={item.id} className="flex gap-3 text-sm">
                <span className="font-display font-bold text-primary tabular-nums">{item.time}</span>
                <span className="truncate text-muted-foreground">{item.title}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <nav className="mt-6 flex gap-2 overflow-x-auto">
        {(
          [
            ["abertura", "Checklist de abertura"],
            ["emergencia", "Emergências"],
            ["equipe", "Equipe no local"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2 font-display text-sm font-bold transition-colors duration-200",
              tab === key
                ? "border-primary/40 bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="mt-4">
        {tab === "abertura" && (
          <div className="surface-card animate-fade-up p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-bold">
                {openDone}/{opening.items.length} prontos
              </p>
              <span className="font-display text-lg font-black text-primary tabular-nums">{openPct}%</span>
            </div>
            <ProgressBar value={openPct} tone={openPct === 100 ? "success" : "primary"} className="mt-3 h-2.5" />
            <div className="mt-4 sm:columns-2 lg:columns-3">
              {opening.items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  label={item.label}
                  done={item.done}
                  onToggle={() => toggleGroupItem("opening", item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {tab === "emergencia" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contingencies.map((item) => (
              <article key={item.id} className="surface-card animate-fade-up p-4">
                <p className="flex items-start gap-2 font-display text-sm font-bold">
                  <LifeBuoy className="mt-0.5 size-4 shrink-0 text-warning" />
                  {item.problem}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{item.action}</p>
                <div className="mt-3">
                  <WhatsappButton number={item.whatsapp} label={item.owner.split(" ")[0] ?? "Acionar"} />
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "equipe" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <article key={member.id} className="surface-card animate-fade-up grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.area} · {member.role}
                  </p>
                </div>
                <WhatsappButton number={member.whatsapp} label="" />
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Mic className="size-3.5 text-primary" /> Modo Evento — foco total na execução.
      </p>
    </div>
  );
}
