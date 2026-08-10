import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, MapPin, Timer, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { Panel, StatusBadge } from "@/components/forja/ui-kit";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUS_LABEL, type TaskStatus } from "@/lib/forja-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/programacao")({
  head: () => ({
    meta: [
      { title: "Programação — FORJA Event Command Center" },
      { name: "description", content: "Timeline oficial do evento A Forja, do call da equipe ao encerramento." },
      { property: "og:title", content: "Programação — FORJA" },
      { property: "og:description", content: "Horários, responsáveis, duração e local de cada etapa do evento." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { schedule, updateScheduleItem, reorderSchedule } = useForja();
  const [dragging, setDragging] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const doneCount = schedule.filter((s) => s.status === "concluido").length;

  return (
    <div className="space-y-6">
      <Panel
        title="Timeline oficial"
        description={`${schedule.length} etapas · ${doneCount} concluídas · arraste para reordenar`}
      >
        <ol className="relative space-y-2 before:absolute before:top-2 before:bottom-2 before:left-[4.9rem] before:hidden before:w-px before:bg-border sm:before:block">
          {schedule.map((item) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragging(item.id)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging && dragging !== item.id) {
                  reorderSchedule(dragging, item.id);
                  toast.success("Programação reordenada");
                }
                setDragging(null);
              }}
              className={cn(
                "surface-card surface-card-hover animate-fade-up relative flex cursor-grab items-start gap-3 p-4 active:cursor-grabbing",
                dragging === item.id && "opacity-50",
              )}
            >
              <GripVertical className="mt-1 size-4 shrink-0 text-muted-foreground/60" />
              <span className="w-12 shrink-0 font-display text-base font-bold text-primary tabular-nums">
                {item.time}
              </span>
              <span className="hidden size-2.5 shrink-0 translate-y-2 rounded-full border-2 border-background bg-primary sm:block" />

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                  className="w-full text-left"
                >
                  <p className="truncate font-display text-sm font-bold">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="size-3.5" />
                      {item.owner}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Timer className="size-3.5" />
                      {item.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {item.place}
                    </span>
                  </div>
                </button>

                {open === item.id && (
                  <div className="animate-fade-up mt-3 grid gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-3">
                    <label className="space-y-1.5 text-xs">
                      <span className="label-caps">Horário</span>
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(item.id, { time: e.target.value })}
                      />
                    </label>
                    <label className="space-y-1.5 text-xs">
                      <span className="label-caps">Duração</span>
                      <Input
                        maxLength={20}
                        value={item.duration}
                        onChange={(e) => updateScheduleItem(item.id, { duration: e.target.value })}
                      />
                    </label>
                    <label className="space-y-1.5 text-xs">
                      <span className="label-caps">Local</span>
                      <Input
                        maxLength={40}
                        value={item.place}
                        onChange={(e) => updateScheduleItem(item.id, { place: e.target.value })}
                      />
                    </label>
                    <label className="space-y-1.5 text-xs sm:col-span-3">
                      <span className="label-caps">Observação</span>
                      <Input
                        maxLength={200}
                        value={item.notes}
                        placeholder="Detalhes operacionais desta etapa"
                        onChange={(e) => updateScheduleItem(item.id, { notes: e.target.value })}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <Select
                  value={item.status}
                  onValueChange={(v) => updateScheduleItem(item.id, { status: v as TaskStatus })}
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
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Resumo">
        <div className="flex flex-wrap gap-2">
          {schedule.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
              <strong className="font-display text-primary">{item.time}</strong>
              {item.title}
              <StatusBadge status={item.status} />
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}
