import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, MapPin, Timer, User, Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { Panel, StatusBadge } from "@/components/forja/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
import { TASK_STATUS_LABEL, type TaskStatus, type ScheduleItem } from "@/lib/forja-data";
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
  const { schedule, updateScheduleItem, reorderSchedule, addScheduleItem, removeScheduleItem } = useForja();
  const [dragging, setDragging] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sortedSchedule = useMemo(() => {
    return [...schedule].sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule]);

  const doneCount = schedule.filter((s) => s.status === "concluido").length;

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      time: formData.get("time") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      owner: formData.get("owner") as string,
      duration: formData.get("duration") as string,
      place: formData.get("place") as string,
      status: "nao-iniciado",
      notes: formData.get("notes") as string,
    };

    addScheduleItem(newItem);
    setIsAddModalOpen(false);
    toast.success("Item adicionado à timeline!");
  };

  const itemToDelete = schedule.find((s) => s.id === deleteId);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Programação</h1>
          <p className="text-sm text-muted-foreground">Timeline oficial do evento organizada cronologicamente.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95">
              <Plus className="size-4" />
              Adicionar Timeline
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl border-primary/20 bg-surface sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">Novo Item na Timeline</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" name="time" type="time" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input id="duration" name="duration" placeholder="Ex: 45 min" required className="bg-background/50" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Título da Etapa</Label>
                  <Input id="title" name="title" placeholder="Ex: Abertura Oficial" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Responsável</Label>
                  <Input id="owner" name="owner" placeholder="Nome do responsável" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Local</Label>
                  <Input id="place" name="place" placeholder="Ex: Palco Principal" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Input id="description" name="description" placeholder="O que acontece nesta etapa?" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Detalhadas</Label>
                <Textarea id="notes" name="notes" placeholder="Detalhes operacionais..." className="min-h-[80px] bg-background/50" />
              </div>
              <DialogFooter className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  Salvar na Timeline
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Panel
        title="Timeline oficial"
        description={`${schedule.length} etapas · ${doneCount} concluídas · organizada por horário`}
      >
        <ol className="relative space-y-2 before:absolute before:top-2 before:bottom-2 before:left-[4.9rem] before:hidden before:w-px before:bg-border sm:before:block">
          {sortedSchedule.map((item) => (
            <li
              key={item.id}
              className={cn(
                "surface-card surface-card-hover animate-fade-up group relative flex items-start gap-3 p-4 transition-all duration-300",
                dragging === item.id && "opacity-50 scale-95",
              )}
            >
              <div className="mt-1 flex flex-col items-center">
                <GripVertical className="size-4 shrink-0 text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <span className="w-12 shrink-0 font-display text-base font-bold text-primary tabular-nums">
                {item.time}
              </span>
              <span className="hidden size-2.5 shrink-0 translate-y-2 rounded-full border-2 border-background bg-primary shadow-[0_0_10px_rgba(230,188,99,0.5)] sm:block" />

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                  className="w-full text-left"
                >
                  <p className="truncate font-display text-sm font-bold transition-colors group-hover:text-primary">
                    {item.title}
                  </p>
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
                  <div className="animate-in slide-in-from-top-2 fade-in mt-3 grid gap-3 rounded-lg border border-border bg-surface p-3 duration-300 sm:grid-cols-3">
                    <label className="space-y-1.5 text-xs">
                      <span className="label-caps">Horário</span>
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(item.id, { time: e.target.value })}
                        className="bg-background/50 h-8 text-xs"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs">
                      <span className="label-caps">Duração</span>
                      <Input
                        maxLength={20}
                        value={item.duration}
                        onChange={(e) => updateScheduleItem(item.id, { duration: e.target.value })}
                        className="bg-background/50 h-8 text-xs"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs">
                      <span className="label-caps">Local</span>
                      <Input
                        maxLength={40}
                        value={item.place}
                        onChange={(e) => updateScheduleItem(item.id, { place: e.target.value })}
                        className="bg-background/50 h-8 text-xs"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs sm:col-span-3">
                      <span className="label-caps">Observação</span>
                      <Input
                        maxLength={200}
                        value={item.notes}
                        placeholder="Detalhes operacionais desta etapa"
                        onChange={(e) => updateScheduleItem(item.id, { notes: e.target.value })}
                        className="bg-background/50 h-8 text-xs"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
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
                
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="flex size-8 items-center justify-center rounded-lg border border-destructive/20 text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            removeScheduleItem(deleteId);
            setDeleteId(null);
            toast.success("Item removido da programação!");
          }
        }}
        title="Remover da Programação"
        itemName={itemToDelete?.title}
      />

      <Panel title="Resumo">
        <div className="flex flex-wrap gap-2">
          {sortedSchedule.map((item) => (
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
