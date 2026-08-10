import { createFileRoute } from "@tanstack/react-router";
import { Film } from "lucide-react";

import { useForja } from "@/components/forja/store";
import { ChecklistItem, Panel, ProgressBar, StatusBadge } from "@/components/forja/ui-kit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUS_LABEL, formatDate, type TaskStatus } from "@/lib/forja-data";

export const Route = createFileRoute("/_shell/midia")({
  head: () => ({
    meta: [
      { title: "Mídia — FORJA Event Command Center" },
      { name: "description", content: "Cenas obrigatórias, planos de captação e entregáveis de mídia da Forja." },
      { property: "og:title", content: "Mídia — FORJA" },
      { property: "og:description", content: "Storymaker, videomaker, fotógrafo e social media com checklists ao vivo." },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  const { media, deliverables, toggleMediaItem, updateDeliverable } = useForja();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {media.map((group) => {
          const done = group.items.filter((i) => i.done).length;
          const pct = Math.round((done / group.items.length) * 100);
          return (
            <Panel
              key={group.id}
              title={group.title}
              description={group.subtitle}
              action={
                <span className="font-display text-sm font-bold text-primary tabular-nums">
                  {done}/{group.items.length}
                </span>
              }
            >
              <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} className="mb-3 h-1.5" />
              <div className="sm:columns-2">
                {group.items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    label={item.label}
                    done={item.done}
                    onToggle={() => toggleMediaItem(group.id, item.id)}
                  />
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="Entregáveis" description="O que precisa ser produzido depois da captação">
        <ul className="divide-y divide-border">
          {deliverables.map((item) => (
            <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.owner ?? "Sem responsável"} · prazo {formatDate(item.dueDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} className="hidden sm:inline-flex" />
                <Select
                  value={item.status}
                  onValueChange={(v) => updateDeliverable(item.id, { status: v as TaskStatus })}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
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
        </ul>
      </Panel>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Film className="size-4 text-primary" />
        Nenhuma cena da lista é opcional: elas alimentam o aftermovie e os reels da próxima edição.
      </p>
    </div>
  );
}
