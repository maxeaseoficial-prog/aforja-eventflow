import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { ChecklistItem, EmptyState, Panel, ProgressBar } from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Rotate3d } from "lucide-react";

export const Route = createFileRoute("/_shell/pos-evento")({
  head: () => ({
    meta: [
      { title: "Pós-evento — FORJA Event Command Center" },
      { name: "description", content: "Entregas finais, aprendizados e preparação da próxima edição da Forja." },
      { property: "og:title", content: "Pós-evento — FORJA" },
      { property: "og:description", content: "Checklist de fechamento e registro estruturado de aprendizados." },
    ],
  }),
  component: PostEventPage,
});

const FIELDS = [
  { key: "worked", label: "O que funcionou" },
  { key: "failed", label: "O que não funcionou" },
  { key: "improve", label: "O que melhorar" },
  { key: "nextEdition", label: "Para a próxima edição" },
] as const;

function PostEventPage() {
  const { postEvent, learnings, toggleGroupItem, addLearning } = useForja();
  const [form, setForm] = useState({ worked: "", failed: "", improve: "", nextEdition: "" });

  const done = postEvent.items.filter((i) => i.done).length;
  const pct = Math.round((done / postEvent.items.length) * 100);

  return (
    <div className="space-y-6">
      <Panel
        title="Checklist de fechamento"
        description={`${done} de ${postEvent.items.length} concluídos`}
        action={<span className="font-display text-lg font-bold text-primary tabular-nums">{pct}%</span>}
      >
        <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} className="mb-4 h-2.5" />
        <div className="sm:columns-2">
          {postEvent.items.map((item) => (
            <ChecklistItem
              key={item.id}
              label={item.label}
              done={item.done}
              onToggle={() => toggleGroupItem("postEvent", item.id)}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Registrar aprendizado" description="A base da próxima edição da Forja">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Textarea
                id={field.key}
                rows={3}
                maxLength={500}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            className="gap-1.5"
            onClick={() => {
              if (Object.values(form).every((v) => v.trim().length === 0)) {
                toast.error("Preencha ao menos um campo.");
                return;
              }
              addLearning({ id: `l-${Date.now()}`, ...form });
              setForm({ worked: "", failed: "", improve: "", nextEdition: "" });
              toast.success("Aprendizado registrado");
            }}
          >
            <Plus className="size-4" /> Registrar
          </Button>
        </div>
      </Panel>

      {learnings.length === 0 ? (
        <EmptyState
          icon={Rotate3d}
          title="Nenhum aprendizado registrado"
          description="Depois do evento, registre o que funcionou e o que precisa mudar."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {learnings.map((entry) => (
            <article key={entry.id} className="surface-card animate-fade-up p-5">
              {FIELDS.map((field) =>
                entry[field.key] ? (
                  <div key={field.key} className="mb-3 last:mb-0">
                    <p className="label-caps">{field.label}</p>
                    <p className="mt-1 text-sm whitespace-pre-line">{entry[field.key]}</p>
                  </div>
                ) : null,
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
