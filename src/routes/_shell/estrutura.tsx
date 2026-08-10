import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import { useState } from "react";

import { useForja } from "@/components/forja/store";
import { Panel } from "@/components/forja/ui-kit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Equipment } from "@/lib/forja-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/estrutura")({
  head: () => ({
    meta: [
      { title: "Estrutura — FORJA Event Command Center" },
      { name: "description", content: "Equipamentos, testes e plano B de som, vídeo, energia e internet da Forja." },
      { property: "og:title", content: "Estrutura — FORJA" },
      { property: "og:description", content: "Cada equipamento com item principal, reserva e status de teste." },
    ],
  }),
  component: StructurePage,
});

const TEST_META: Record<Equipment["test"], { label: string; icon: typeof CheckCircle2; className: string }> = {
  aprovado: { label: "Aprovado", icon: CheckCircle2, className: "text-success" },
  pendente: { label: "Pendente", icon: CircleDashed, className: "text-warning" },
  reprovado: { label: "Reprovado", icon: AlertTriangle, className: "text-destructive" },
};

function StructurePage() {
  const { equipment, updateEquipment } = useForja();
  const [onlyCritical, setOnlyCritical] = useState(false);

  const list = onlyCritical ? equipment.filter((e) => e.critical) : equipment;
  const approved = equipment.filter((e) => e.test === "aprovado").length;
  const failed = equipment.filter((e) => e.test === "reprovado");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Equipamentos", value: equipment.length, tone: "text-foreground" },
          { label: "Testados", value: approved, tone: "text-success" },
          { label: "Reprovados", value: failed.length, tone: "text-destructive" },
        ].map((card) => (
          <div key={card.label} className="surface-card animate-fade-up p-5">
            <p className="label-caps">{card.label}</p>
            <p className={cn("mt-2 font-display text-2xl font-bold tabular-nums", card.tone)}>{card.value}</p>
          </div>
        ))}
      </div>

      {failed.length > 0 && (
        <div className="animate-fade-up rounded-xl border border-destructive/30 bg-destructive-soft p-4">
          <p className="flex items-center gap-2 font-display text-sm font-bold text-destructive">
            <AlertTriangle className="size-4" /> Atenção: {failed.length} item(ns) reprovado(s)
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {failed.map((e) => e.name).join(", ")} — ativar o plano B antes do evento.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOnlyCritical((v) => !v)}
        className={cn(
          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
          onlyCritical
            ? "border-primary/30 bg-primary-soft text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
      >
        Somente equipamentos críticos
      </button>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => {
          const meta = TEST_META[item.test];
          const Icon = meta.icon;
          return (
            <article key={item.id} className="surface-card surface-card-hover animate-fade-up p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-bold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">Responsável: {item.owner}</p>
                </div>
                {item.critical && (
                  <span className="shrink-0 rounded-md border border-destructive/30 bg-destructive-soft px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-destructive uppercase">
                    Crítico
                  </span>
                )}
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Principal</dt>
                  <dd className="truncate text-right font-medium">{item.primary}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Plano B</dt>
                  <dd className="truncate text-right font-medium">{item.backup}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.className)}>
                  <Icon className="size-4" />
                  {meta.label}
                </span>
                <Select
                  value={item.test}
                  onValueChange={(v) => updateEquipment(item.id, { test: v as Equipment["test"] })}
                >
                  <SelectTrigger className="ml-auto h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </article>
          );
        })}
      </div>

      <Panel title="Regra de ouro">
        <p className="text-sm text-muted-foreground">
          Nenhum equipamento crítico entra no evento sem teste aprovado e plano B definido.
        </p>
      </Panel>
    </div>
  );
}
