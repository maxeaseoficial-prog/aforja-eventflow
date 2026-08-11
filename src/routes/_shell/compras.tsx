import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useForja, useForjaMetrics } from "@/components/forja/store";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
import {
  EmptyState,
  Panel,
  ProgressBar,
  PurchaseStatusBadge,
  WhatsappButton,
} from "@/components/forja/ui-kit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PURCHASE_STATUS_LABEL,
  brl,
  formatDate,
  type Purchase,
  type PurchaseStatus,
} from "@/lib/forja-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/compras")({
  head: () => ({
    meta: [
      { title: "Compras — FORJA Event Command Center" },
      { name: "description", content: "Controle de itens, fornecedores, prazos e orçamento das compras da Forja." },
      { property: "og:title", content: "Compras — FORJA" },
      { property: "og:description", content: "Orçamento previsto, gasto e restante com status de cada item." },
    ],
  }),
  component: PurchasesPage,
});

function PurchasesPage() {
  const { purchases, event, updatePurchase, addPurchase, removePurchase, responsibles } = useForja();
  const metrics = useForjaMetrics();
  const [status, setStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("todos");
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ item: "", quantity: "1", estimated: "0" });

  const owners = Array.from(new Set(purchases.map((p) => p.owner).filter(Boolean) as string[]));

  const filtered = useMemo(
    () =>
      purchases.filter((p) => {
        if (status !== "todos" && p.status !== status) return false;
        if (owner !== "todos" && p.owner !== owner) return false;
        if (search && !p.item.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [purchases, status, owner, search],
  );

  const remaining = event.budget - metrics.spent;
  const usage = Math.round((metrics.spent / event.budget) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card animate-fade-up p-5">
          <p className="label-caps">Orçamento</p>
          <p className="mt-2 font-display text-2xl font-bold">{brl(event.budget)}</p>
        </div>
        <div className="surface-card animate-fade-up p-5">
          <p className="label-caps">Gasto</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary">{brl(metrics.spent)}</p>
        </div>
        <div className="surface-card animate-fade-up p-5">
          <p className="label-caps">Restante</p>
          <p
            className={cn(
              "mt-2 font-display text-2xl font-bold",
              remaining < 0 ? "text-destructive" : "text-success",
            )}
          >
            {brl(remaining)}
          </p>
        </div>
      </div>

      <Panel title="Utilização do orçamento" description={`${usage}% utilizado · previsto ${brl(metrics.estimated)}`}>
        <ProgressBar value={usage} tone={usage > 90 ? "warning" : "primary"} className="h-2.5" />
      </Panel>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <Input placeholder="Buscar item..." value={search} maxLength={60} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(PURCHASE_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os responsáveis</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="gap-1.5" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" /> Novo item
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma compra nesse filtro"
          description="Cadastre o que precisa ser comprado ou contratado para a Forja."
          action={<Button onClick={() => setNewOpen(true)}>+ Novo item</Button>}
        />
      ) : (
        <>
          {/* Desktop table */}
          <Panel className="hidden lg:block">
            <div className="forja-scroll overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Item", "Qtd", "Previsto", "Real", "Responsável", "Fornecedor", "Prazo", "Status", ""].map(
                      (head) => (
                        <th key={head} className="label-caps pb-3 pr-4 font-bold">
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((purchase) => (
                    <tr key={purchase.id} className="transition-colors duration-200 hover:bg-card-hover">
                      <td className="py-3 pr-4 font-medium">{purchase.item}</td>
                      <td className="py-3 pr-4 tabular-nums text-muted-foreground">{purchase.quantity}</td>
                      <td className="py-3 pr-4 tabular-nums text-muted-foreground">{brl(purchase.estimated)}</td>
                      <td className="py-3 pr-4 tabular-nums">
                        {purchase.actual !== null ? brl(purchase.actual) : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {purchase.owner ?? <span className="text-destructive">Não definido</span>}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{purchase.supplier || "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatDate(purchase.dueDate)}</td>
                      <td className="py-3 pr-4">
                        <Select
                          value={purchase.status}
                          onValueChange={(v) => updatePurchase(purchase.id, { status: v as PurchaseStatus })}
                        >
                          <SelectTrigger className="h-8 w-40 border-border bg-card text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PURCHASE_STATUS_LABEL).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <WhatsappButton number={purchase.whatsapp} label="" />
                          <button
                            type="button"
                            aria-label="Excluir"
                            onClick={() => setDeleting(purchase)}
                            className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Mobile cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((purchase) => (
              <article key={purchase.id} className="surface-card surface-card-hover animate-fade-up p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{purchase.item}</p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.quantity} un · {brl(purchase.estimated)}
                    </p>
                  </div>
                  <PurchaseStatusBadge status={purchase.status} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {purchase.owner ?? <span className="text-destructive">Sem responsável</span>} ·{" "}
                  {formatDate(purchase.dueDate)}
                </p>
                <div className="mt-3 flex gap-2">
                  <WhatsappButton number={purchase.whatsapp} />
                  <Select
                    value={purchase.status}
                    onValueChange={(v) => updatePurchase(purchase.id, { status: v as PurchaseStatus })}
                  >
                    <SelectTrigger className="h-8 flex-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PURCHASE_STATUS_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="bg-surface">
          <DialogHeader>
            <DialogTitle className="font-display">Novo item de compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pitem">Item</Label>
              <Input
                id="pitem"
                maxLength={80}
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pqty">Quantidade</Label>
                <Input
                  id="pqty"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pest">Valor previsto (R$)</Label>
                <Input
                  id="pest"
                  type="number"
                  min={0}
                  value={form.estimated}
                  onChange={(e) => setForm({ ...form, estimated: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (form.item.trim().length < 2) {
                  toast.error("Informe o item.");
                  return;
                }
                addPurchase({
                  id: `p-${Date.now()}`,
                  item: form.item.trim(),
                  category: "Geral",
                  quantity: Number(form.quantity) || 1,
                  estimated: Number(form.estimated) || 0,
                  actual: null,
                  owner: responsibles[0]?.name ?? null,
                  whatsapp: responsibles[0]?.whatsapp ?? "",
                  supplier: "",
                  dueDate: new Date().toISOString().slice(0, 10),
                  status: "precisa-comprar",
                  notes: "",
                });
                toast.success("Item adicionado");
                setForm({ item: "", quantity: "1", estimated: "0" });
                setNewOpen(false);
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            removePurchase(deleting.id);
            toast.success("Item excluído com sucesso.");
            setDeleting(null);
          }
        }}
        itemName={deleting?.item}
        title="Excluir item de compra?"
      />
    </div>
  );
}
