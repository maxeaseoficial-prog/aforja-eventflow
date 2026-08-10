import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { useForja } from "@/components/forja/store";
import { ChecklistItem, Panel, ProgressBar } from "@/components/forja/ui-kit";

export const Route = createFileRoute("/_shell/experiencia")({
  head: () => ({
    meta: [
      { title: "Experiência do convidado — FORJA Event Command Center" },
      { name: "description", content: "Jornada completa do convidado da Forja, da confirmação à pesquisa de satisfação." },
      { property: "og:title", content: "Experiência do convidado — FORJA" },
      { property: "og:description", content: "17 pontos de contato monitorados para uma experiência impecável." },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { experience, toggleGroupItem } = useForja();
  const done = experience.items.filter((i) => i.done).length;
  const pct = Math.round((done / experience.items.length) * 100);

  const before = experience.items.slice(0, 5);
  const during = experience.items.slice(5, 15);
  const after = experience.items.slice(15);

  const stages = [
    { title: "Antes do evento", items: before },
    { title: "Durante o evento", items: during },
    { title: "Depois do evento", items: after },
  ];

  return (
    <div className="space-y-6">
      <Panel
        title="Progresso da jornada"
        description={experience.subtitle}
        action={<span className="font-display text-lg font-bold text-primary tabular-nums">{pct}%</span>}
      >
        <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} className="h-2.5" />
        <p className="mt-3 text-sm text-muted-foreground">
          {done} de {experience.items.length} pontos de contato prontos.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {stages.map((stage) => (
          <Panel key={stage.title} title={stage.title}>
            {stage.items.map((item) => (
              <ChecklistItem
                key={item.id}
                label={item.label}
                done={item.done}
                onToggle={() => toggleGroupItem("experience", item.id)}
              />
            ))}
          </Panel>
        ))}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="size-4 text-primary" />
        A experiência do convidado é o que faz a Forja ser lembrada — cada detalhe conta.
      </p>
    </div>
  );
}
