import { createFileRoute } from "@tanstack/react-router";
import { Film, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { ChecklistItem, Panel, ProgressBar, StatusBadge } from "@/components/forja/ui-kit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
import { TASK_STATUS_LABEL, formatDate, type TaskStatus, type Deliverable } from "@/lib/forja-data";

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
  const { media, deliverables, toggleMediaItem, updateMediaDeliverable, addMediaDeliverable, removeMediaDeliverable } = useForja();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddDeliverable = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDeliverable: Deliverable = {
      id: crypto.randomUUID(),
      title: formData.get("title") as string,
      owner: formData.get("owner") as string,
      dueDate: formData.get("dueDate") as string,
      status: "nao-iniciado",
    };

    addMediaDeliverable(newDeliverable);
    setIsAddModalOpen(false);
    toast.success("Entregável de mídia adicionado!");
  };

  const deliverableToDelete = deliverables.find(d => d.id === deleteId);

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

      <Panel 
        title="Entregáveis" 
        description="O que precisa ser produzido depois da captação"
        action={
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20">
                <Plus className="size-3.5" />
                Novo Entregável
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-primary/20 bg-surface">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-primary">Novo Entregável de Mídia</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDeliverable} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Entregável</Label>
                  <Input id="title" name="title" placeholder="Ex: Aftermovie Oficial" required className="bg-background/50" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="owner">Responsável</Label>
                    <Input id="owner" name="owner" placeholder="Nome" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Prazo</Label>
                    <Input id="dueDate" name="dueDate" type="date" required className="bg-background/50" />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                    Cadastrar
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        <ul className="divide-y divide-border">
          {deliverables.map((item) => (
            <li key={item.id} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
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
                  onValueChange={(v) => updateMediaDeliverable(item.id, { status: v as TaskStatus })}
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
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="flex size-8 items-center justify-center rounded-lg border border-destructive/20 text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            removeMediaDeliverable(deleteId);
            setDeleteId(null);
            toast.success("Entregável removido!");
          }
        }}
        title="Remover Entregável"
        itemName={deliverableToDelete?.title}
      />

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Film className="size-4 text-primary" />
        Nenhuma cena da lista é opcional: elas alimentam o aftermovie e os reels da próxima edição.
      </p>
    </div>
  );
}
