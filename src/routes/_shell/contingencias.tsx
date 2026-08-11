import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { useForja } from "@/components/forja/store";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
import { Panel, WhatsappButton } from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const { contingencies, updateContingency, addContingency, removeContingency, responsibles } = useForja();
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ problem: "", action: "", planB: "" });

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar problema..."
          maxLength={60}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setNewOpen(true)} className="gap-2">
          <Plus className="size-4" /> Adicionar Contingência
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((item) => (
          <article key={item.id} className="surface-card surface-card-hover animate-fade-up p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="flex items-start gap-2 font-display text-base font-bold">
                <LifeBuoy className="mt-0.5 size-4 shrink-0 text-warning" />
                <span className="min-w-0">Se {item.problem.toLowerCase()}</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeleting(item)}
                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

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

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="bg-surface">
          <DialogHeader>
            <DialogTitle>Nova Contingência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="problem">Problema (O que pode falhar?)</Label>
              <Input
                id="problem"
                placeholder="Ex: Falta de energia"
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Ação Imediata</Label>
              <Textarea
                id="action"
                placeholder="Ex: Acionar gerador manualmente"
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planB">Plano B (Solução definitiva)</Label>
              <Textarea
                id="planB"
                placeholder="Ex: Chamar técnico da concessionária"
                value={form.planB}
                onChange={(e) => setForm({ ...form, planB: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!form.problem || !form.action) {
                  toast.error("Preencha o problema e a ação imediata.");
                  return;
                }
                addContingency({
                  id: `c-${Date.now()}`,
                  problem: form.problem,
                  action: form.action,
                  planB: form.planB,
                  owner: responsibles[0]?.name || "Diretor",
                  whatsapp: responsibles[0]?.whatsapp || "",
                  notes: "",
                });
                toast.success("Contingência adicionada");
                setNewOpen(false);
                setForm({ problem: "", action: "", planB: "" });
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            removeContingency(deleting.id);
            toast.success("Contingência removida.");
            setDeleting(null);
          }
        }}
        itemName={deleting?.problem}
        title="Excluir Contingência?"
      />
    </div>
  );
}
