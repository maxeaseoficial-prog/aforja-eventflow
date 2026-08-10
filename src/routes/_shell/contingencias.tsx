import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useForja } from "@/components/forja/store";
import { Panel, WhatsappButton } from "@/components/forja/ui-kit";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_shell/contingencias")({
  head: () => ({
    meta: [
      { title: "Contingências — FORJA Event Command Center" },
      { name: "description", content: "Plano de resposta rápida para cada falha possível durante o evento A Forja." },
      { property: "og:title", content: "Contingências — FORJA" },
      { property: "og:description", content: "Problema, ação imediata, responsável e plano B em uma única tela." },
    ],
  }),
  component: ContingencyPage,
});

function ContingencyPage() {
  const { contingencies, updateContingency } = useForja();
  const [search, setSearch] = useState("");

  const list = contingencies.filter((c) => c.problem.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="animate-fade-up rounded-xl border border-warning/30 bg-warning-soft p-4">
        <p className="flex items-center gap-2 font-display text-sm font-bold text-warning">
          <ShieldCheck className="size-4" /> Protocolo de crise
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nada de improviso no dia: identifique o problema, execute a ação imediata e avise o responsável pelo
          WhatsApp.
        </p>
      </div>

      <Input
        placeholder="Buscar problema..."
        maxLength={60}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((item) => (
          <article key={item.id} className="surface-card surface-card-hover animate-fade-up p-5">
            <h3 className="flex items-start gap-2 font-display text-base font-bold">
              <LifeBuoy className="mt-0.5 size-4 shrink-0 text-warning" />
              <span className="min-w-0">Se {item.problem.toLowerCase()}</span>
            </h3>

            <div className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
              <div>
                <p className="label-caps">Ação imediata</p>
                <p className="mt-1 font-medium">{item.action}</p>
              </div>
              <div>
                <p className="label-caps">Plano B</p>
                <p className="mt-1 text-muted-foreground">{item.planB}</p>
              </div>
              <div>
                <p className="label-caps">Responsável</p>
                <p className="mt-1 font-medium">{item.owner}</p>
              </div>
              <label className="block">
                <span className="label-caps">Observações</span>
                <Input
                  className="mt-1"
                  maxLength={200}
                  placeholder="Anote decisões tomadas no dia"
                  value={item.notes}
                  onChange={(e) => updateContingency(item.id, { notes: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-4">
              <WhatsappButton number={item.whatsapp} label={`Acionar ${item.owner.split(" ")[0]}`} />
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <Panel>
          <p className="text-sm text-muted-foreground">Nenhuma contingência encontrada para essa busca.</p>
        </Panel>
      )}
    </div>
  );
}
