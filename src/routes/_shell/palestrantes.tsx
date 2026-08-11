import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, Mic, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { useForja } from "@/components/forja/store";
import {
  Avatar,
  ChecklistItem,
  FieldRow,
  Panel,
  PersonStatusBadge,
  ProgressBar,
  WhatsappButton,
} from "@/components/forja/ui-kit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
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
import { Textarea } from "@/components/ui/textarea";
import { SPEAKER_CHECKLIST, type PersonStatus, type Speaker } from "@/lib/forja-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/palestrantes")({
  head: () => ({
    meta: [
      { title: "Palestrantes — FORJA Event Command Center" },
      { name: "description", content: "Preparação completa de cada palestrante da Forja: checklist, horários e contatos." },
      { property: "og:title", content: "Palestrantes — FORJA" },
      { property: "og:description", content: "14 etapas de preparação por palestrante, com progresso individual." },
    ],
  }),
  component: SpeakersPage,
});

function SpeakersPage() {
  const { speakers, toggleSpeakerStep, updateSpeaker, addSpeaker, removeSpeaker } = useForja();
  const [openId, setOpenId] = useState<string | null>(speakers[0]?.id ?? null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSpeaker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSpeaker: Speaker = {
      id: crypto.randomUUID(),
      name: formData.get("name") as string,
      whatsapp: formData.get("whatsapp") as string,
      instagram: formData.get("instagram") as string,
      theme: formData.get("theme") as string,
      talkTitle: formData.get("talkTitle") as string,
      talkTime: formData.get("talkTime") as string,
      arrival: formData.get("arrival") as string,
      duration: (formData.get("duration") as string) || "45 min",
      status: "pendente",
      notes: formData.get("notes") as string,
      checklist: new Array(SPEAKER_CHECKLIST.length).fill(false),
    };

    addSpeaker(newSpeaker);
    setIsAddModalOpen(false);
    toast.success("Palestrante adicionado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Palestrantes</h1>
          <p className="text-sm text-muted-foreground">Gerencie a preparação e logística de cada convidado.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95">
              <Plus className="size-4" />
              Adicionar Palestrante
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl border-primary/20 bg-surface sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">Novo Palestrante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSpeaker} className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" name="name" placeholder="Ex: João Silva" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema / Especialidade</Label>
                  <Input id="theme" name="theme" placeholder="Ex: Liderança, Vendas..." required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="talkTitle">Título da Palestra</Label>
                  <Input id="talkTitle" name="talkTitle" placeholder="Ex: O Futuro do Mercado" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
                  <Input id="whatsapp" name="whatsapp" placeholder="Ex: 5542999998888" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" name="instagram" placeholder="Ex: @joaosilva" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival">Horário de Chegada</Label>
                  <Input id="arrival" name="arrival" placeholder="Ex: 14:00" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="talkTime">Horário da Palestra</Label>
                  <Input id="talkTime" name="talkTime" placeholder="Ex: 15:30" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input id="duration" name="duration" placeholder="Ex: 45 min" defaultValue="45 min" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" placeholder="Detalhes adicionais..." className="min-h-[80px] bg-background/50" />
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
                  Cadastrar Palestrante
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {speakers.map((speaker) => {
          const done = speaker.checklist.filter(Boolean).length;
          const pct = Math.round((done / SPEAKER_CHECKLIST.length) * 100);
          const expanded = openId === speaker.id;

          return (
            <article key={speaker.id} className="surface-card animate-fade-up p-5 shadow-card">
              <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <Avatar name={speaker.name} size="lg" />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-bold">{speaker.name}</h2>
                  <p className="truncate text-sm text-muted-foreground">{speaker.talkTitle}</p>
                  <p className="label-caps mt-1">{speaker.theme}</p>
                </div>
                <PersonStatusBadge status={speaker.status} />
              </header>

              <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
                <FieldRow
                  label="Palestra"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      {speaker.talkTime} · {speaker.duration}
                    </span>
                  }
                />
                <FieldRow label="Chegada" value={speaker.arrival} />
                <FieldRow label="WhatsApp" value={speaker.whatsapp.replace(/^55/, "")} />
                <FieldRow
                  label="Instagram"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Instagram className="size-3.5" />
                      {speaker.instagram}
                    </span>
                  }
                />
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {done} / {SPEAKER_CHECKLIST.length} etapas concluídas
                  </span>
                  <span className="font-display font-bold text-primary tabular-nums">{pct}%</span>
                </div>
                <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} className="h-2" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <WhatsappButton number={speaker.whatsapp} />
                <Select
                  value={speaker.status}
                  onValueChange={(v) => updateSpeaker(speaker.id, { status: v as PersonStatus })}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="indefinido">Indefinido</SelectItem>
                  </SelectContent>
                </Select>
                <ConfirmDeleteDialog
                  title="Excluir Palestrante"
                  description={`Tem certeza que deseja excluir o palestrante ${speaker.name}? Esta ação não pode ser desfeita.`}
                  onConfirm={() => {
                    removeSpeaker(speaker.id);
                    toast.success("Palestrante excluído!");
                  }}
                >
                  <button className="flex size-8 items-center justify-center rounded-lg border border-destructive/20 text-destructive transition-colors hover:bg-destructive/10">
                    <Trash2 className="size-4" />
                  </button>
                </ConfirmDeleteDialog>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : speaker.id)}
                  className="ml-auto rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-border-strong"
                >
                  {expanded ? "Ocultar checklist" : "Ver checklist"}
                </button>
              </div>

              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300 ease-out",
                  expanded ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0">
                  <div className="rounded-lg border border-border bg-surface p-2 sm:columns-2">
                    {SPEAKER_CHECKLIST.map((label, index) => (
                      <ChecklistItem
                        key={label}
                        label={label}
                        done={speaker.checklist[index] ?? false}
                        onToggle={() => toggleSpeakerStep(speaker.id, index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Panel title="Como usar" className="xl:col-span-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mic className="size-4 text-primary" />
          Um palestrante só está pronto quando as 14 etapas estão concluídas. Use o progresso individual como critério
          de liberação para o palco.
        </p>
      </Panel>
    </div>
  );
}
