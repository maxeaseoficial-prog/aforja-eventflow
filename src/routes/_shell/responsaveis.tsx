import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, UserPlus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { Avatar, EmptyState, FieldRow, Panel, PersonStatusBadge, WhatsappButton } from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PersonStatus, Responsible } from "@/lib/forja-data";

export const Route = createFileRoute("/_shell/responsaveis")({
  head: () => ({
    meta: [
      { title: "Responsáveis — FORJA Event Command Center" },
      { name: "description", content: "Quem responde por som, luz, mídia, palco e cada área do evento A Forja." },
      { property: "og:title", content: "Responsáveis — FORJA" },
      { property: "og:description", content: "Áreas, responsáveis, contatos e status de confirmação." },
    ],
  }),
  component: ResponsiblesPage,
});

function ResponsiblesPage() {
  const { responsibles, updateResponsible, addResponsible, removeResponsible, clearResponsibles } = useForja();
  const [editing, setEditing] = useState<Responsible | null>(null);
  const [filter, setFilter] = useState<"todos" | PersonStatus>("todos");
  const [newAreaOpen, setNewAreaOpen] = useState(false);
  const [newArea, setNewArea] = useState("");

  const list = responsibles.filter((r) => (filter === "todos" ? true : r.status === filter));
  const undefinedCount = responsibles.filter((r) => !r.name).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          {(["todos", "confirmado", "pendente", "indefinido"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-200 " +
                (filter === option
                  ? "border-primary/30 bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {option === "todos" ? "Todas as áreas" : option}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {responsibles.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={() => {
                if (confirm("Deseja apagar todos os responsáveis?")) clearResponsibles();
              }}
            >
              <XCircle className="size-4" /> Apagar todos
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setNewAreaOpen(true)}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nova área</span>
          </Button>
        </div>
      </div>

      {undefinedCount > 0 && (
        <div className="surface-card border-destructive/25 p-4 text-sm">
          <strong className="text-destructive">{undefinedCount} áreas sem responsável.</strong>{" "}
          <span className="text-muted-foreground">Defina antes do dia do evento.</span>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhuma área nesse filtro"
          description="Ajuste o filtro ou crie uma nova área de responsabilidade."
          action={<Button onClick={() => setNewAreaOpen(true)}>+ Nova área</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((responsible) => (
            <article
              key={responsible.id}
              className="surface-card surface-card-hover animate-fade-up p-5 shadow-card"
            >
              <div className="flex items-start gap-3">
                <Avatar name={responsible.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="label-caps">{responsible.area}</p>
                  {responsible.name ? (
                    <>
                      <h3 className="truncate font-display text-base font-bold">{responsible.name}</h3>
                      <p className="truncate text-sm text-muted-foreground">{responsible.role}</p>
                    </>
                  ) : (
                    <p className="mt-1 font-display text-sm font-bold text-destructive">
                      RESPONSÁVEL NÃO DEFINIDO
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-1 border-t border-border pt-3">
                <FieldRow
                  label="WhatsApp"
                  value={responsible.whatsapp ? responsible.whatsapp.replace(/^55/, "") : "—"}
                />
                <FieldRow label="Status" value={<PersonStatusBadge status={responsible.status} />} />
                {responsible.notes && <FieldRow label="Obs." value={responsible.notes} />}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(responsible)}>
                  {responsible.name ? <Pencil className="size-3.5" /> : <UserPlus className="size-3.5" />}
                  {responsible.name ? "Editar" : "Adicionar responsável"}
                </Button>
                <WhatsappButton number={responsible.whatsapp} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Excluir a área "${responsible.area}"?`)) removeResponsible(responsible.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <EditResponsibleDialog
        responsible={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (!editing) return;
          updateResponsible(editing.id, patch);
          toast.success("Responsável atualizado");
          setEditing(null);
        }}
      />

      <Dialog open={newAreaOpen} onOpenChange={setNewAreaOpen}>
        <DialogContent className="bg-surface">
          <DialogHeader>
            <DialogTitle className="font-display">Nova área</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="area">Nome da área</Label>
            <Input id="area" maxLength={60} value={newArea} onChange={(e) => setNewArea(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewAreaOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (newArea.trim().length < 2) {
                  toast.error("Informe o nome da área.");
                  return;
                }
                addResponsible({
                  id: `r-${Date.now()}`,
                  area: newArea.trim(),
                  name: null,
                  role: "—",
                  whatsapp: "",
                  status: "indefinido",
                  notes: "",
                });
                toast.success("Área criada");
                setNewArea("");
                setNewAreaOpen(false);
              }}
            >
              Criar área
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditResponsibleDialog({
  responsible,
  onClose,
  onSave,
}: {
  responsible: Responsible | null;
  onClose: () => void;
  onSave: (patch: Partial<Responsible>) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<PersonStatus>("pendente");
  const [notes, setNotes] = useState("");
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (responsible && loadedId !== responsible.id) {
    setLoadedId(responsible.id);
    setName(responsible.name ?? "");
    setRole(responsible.role === "—" ? "" : responsible.role);
    setWhatsapp(responsible.whatsapp);
    setStatus(responsible.status);
    setNotes(responsible.notes);
  }

  return (
    <Dialog open={!!responsible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface">
        <DialogHeader>
          <DialogTitle className="font-display">{responsible?.area}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resp-name">Nome</Label>
            <Input id="resp-name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resp-role">Função</Label>
              <Input id="resp-role" maxLength={60} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resp-wpp">WhatsApp</Label>
              <Input
                id="resp-wpp"
                maxLength={20}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5542999999999"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PersonStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="indefinido">Indefinido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resp-notes">Observações</Label>
            <Textarea
              id="resp-notes"
              maxLength={500}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              onSave({
                name: name.trim() || null,
                role: role.trim() || "—",
                whatsapp: whatsapp.trim(),
                status: name.trim() ? status : "indefinido",
                notes: notes.trim(),
              })
            }
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
