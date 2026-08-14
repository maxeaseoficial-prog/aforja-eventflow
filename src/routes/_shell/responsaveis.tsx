import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, UserPlus, Trash2, XCircle, LayoutGrid, Network, Users, Layout } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
import { Avatar, EmptyState, FieldRow, PersonStatusBadge, WhatsappButton } from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PersonStatus, Responsible } from "@/lib/forja-data";
import { RESPONSIBLE_SECTORS } from "@/lib/forja-data";
import { OrganogramaTree } from "@/components/forja/OrganogramaTree";
import { TeamBuilderWizard } from "@/components/forja/TeamBuilder/Wizard";


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
  const { responsibles, updateResponsible, addResponsible, removeResponsible, clearResponsibles, preferredTeamView, setPreferredTeamView } = useForja();
  const [editing, setEditing] = useState<Responsible | null>(null);
  const [filter, setFilter] = useState<"todos" | PersonStatus>("todos");
  
  // We handle the view state locally but initialize it from store and sync back when changed
  const [view, setView] = useState<"grid" | "organograma" | "lista" | "colunas">(preferredTeamView || "grid");
  
  const handleViewChange = (newView: "grid" | "organograma" | "lista" | "colunas") => {
    setView(newView);
    setPreferredTeamView(newView);
  };

  const [newAreaOpen, setNewAreaOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [newArea, setNewArea] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSector, setNewSector] = useState("Outro");
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Responsible | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const list = responsibles.filter((r) => (filter === "todos" ? true : r.status === filter));
  const undefinedCount = responsibles.filter((r) => !r.name).length;


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => handleViewChange("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === "grid" ? "bg-primary-soft text-primary" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" /> Grade
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("organograma")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === "organograma" ? "bg-primary-soft text-primary" : "text-muted-foreground"
              )}
            >
              <Network className="size-3.5" /> Organograma
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("lista")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === "lista" ? "bg-primary-soft text-primary" : "text-muted-foreground"
              )}
            >
              <Users className="size-3.5" /> Lista
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("colunas")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === "colunas" ? "bg-primary-soft text-primary" : "text-muted-foreground"
              )}
            >
              <Layout className="size-3.5" /> Colunas
            </button>
          </div>
        </div>
        
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
              onClick={() => setClearingAll(true)}
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

      {responsibles.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhuma área definida"
          description="Comece definindo as áreas do evento manualmente ou use o assistente de equipe."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => setWizardOpen(true)} variant="default" className="bg-primary hover:bg-primary/90">
                Usar Team Builder
              </Button>
              <Button onClick={() => setNewAreaOpen(true)} variant="outline">
                Manual: Nova área
              </Button>
            </div>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((responsible) => (
            <article
              key={responsible.id}
              className="surface-card surface-card-hover animate-fade-up p-5 shadow-card"
            >
              <div className="flex items-start gap-3">
                <Avatar name={responsible.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col">
                    <p className="label-caps">{responsible.area}</p>
                    {responsible.description && (
                      <p className="text-[10px] text-muted-foreground/80 leading-tight italic mt-0.5">
                        {responsible.description}
                      </p>
                    )}
                  </div>
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
                  onClick={() => setDeleting(responsible)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <OrganogramaTree 
          responsibles={responsibles} 
          onEdit={setEditing} 
          onDelete={setDeleting} 
        />
      )}

      <TeamBuilderWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <EditResponsibleDialog
        responsible={editing}
        allResponsibles={responsibles}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (!editing) return;
          updateResponsible(editing.id, patch);
          toast.success("Responsável atualizado");
          setEditing(null);
        }}
      />

      <Dialog open={newAreaOpen} onOpenChange={setNewAreaOpen}>
        <DialogContent className="bg-surface sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Nova área</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="area">Título da área</Label>
                <Input
                  id="area"
                  placeholder="Ex: Coordenador de Programação"
                  maxLength={60}
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Setor</Label>
                <Select value={newSector} onValueChange={setNewSector}>
                  <SelectTrigger id="sector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSIBLE_SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Subtítulo / Descrição</Label>
              <Input
                id="desc"
                placeholder="Ex: controla horários e sequência das atrações."
                maxLength={100}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Responde para (Opcional)</Label>
              <Select value={newParentId || "none"} onValueChange={(v) => setNewParentId(v === "none" ? null : v)}>
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Selecione um superior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguém (Nível 1)</SelectItem>
                  {responsibles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.area} {r.name ? `(${r.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  description: newDescription.trim() || null,
                  name: null,
                  role: "—",
                  whatsapp: "",
                  status: "indefinido",
                  notes: "",
                  sector: newSector,
                  parentId: newParentId,
                  position: { x: 0, y: 0 } // store handle overlapping
                });
                toast.success("Área criada");
                setNewArea("");
                setNewDescription("");
                setNewSector("Outro");
                setNewParentId(null);
                setNewAreaOpen(false);
              }}
            >
              Criar área
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            removeResponsible(deleting.id);
            toast.success("Área excluída com sucesso.");
            setDeleting(null);
          }
        }}
        title="Excluir área?"
        description={
          deleting?.name 
            ? `Tem certeza que deseja excluir a área "${deleting.area}"? Esta ação também removerá os dados do responsável (${deleting.name}) vinculados a esta área.`
            : `Tem certeza que deseja excluir a área "${deleting?.area}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel="Excluir área"
      />

      <ConfirmDeleteDialog
        open={clearingAll}
        onOpenChange={setClearingAll}
        onConfirm={() => {
          clearResponsibles();
          toast.success("Todos os responsáveis foram excluídos.");
          setClearingAll(false);
        }}
        title="Apagar todos os responsáveis?"
        description="Tem certeza que deseja apagar permanentemente todas as áreas e responsáveis do evento? Esta ação não pode ser desfeita."
        confirmLabel="Apagar todos"
      />
    </div>
  );
}

function EditResponsibleDialog({
  responsible,
  onClose,
  onSave,
  allResponsibles,
}: {
  responsible: Responsible | null;
  onClose: () => void;
  onSave: (patch: Partial<Responsible>) => void;
  allResponsibles: Responsible[];
}) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<PersonStatus>("pendente");
  const [notes, setNotes] = useState("");
  const [sector, setSector] = useState("Outro");
  const [parentId, setParentId] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);


  if (responsible && loadedId !== responsible.id) {
    setLoadedId(responsible.id);
    setArea(responsible.area);
    setDescription(responsible.description ?? "");
    setName(responsible.name ?? "");
    setRole(responsible.role === "—" ? "" : responsible.role);
    setWhatsapp(responsible.whatsapp);
    setStatus(responsible.status);
    setNotes(responsible.notes);
    setSector(responsible.sector || "Outro");
    setParentId(responsible.parentId || null);
  }

  const availableParents = allResponsibles.filter(r => r.id !== responsible?.id);

  return (
    <Dialog open={!!responsible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Área</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resp-area">Título da área</Label>
              <Input id="resp-area" maxLength={60} value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resp-sector">Setor</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger id="resp-sector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSIBLE_SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resp-desc">Subtítulo / Descrição</Label>
            <Input id="resp-desc" maxLength={100} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resp-parent">Responde para</Label>
            <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? null : v)}>
              <SelectTrigger id="resp-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguém (Nível 1)</SelectItem>
                {availableParents.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.area} {r.name ? `(${r.name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resp-name">Responsável (Nome)</Label>
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
                area: area.trim(),
                description: description.trim() || null,
                name: name.trim() || null,
                role: role.trim() || "—",
                whatsapp: whatsapp.trim(),
                status: name.trim() ? status : "indefinido",
                notes: notes.trim(),
                sector,
                parentId,
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
