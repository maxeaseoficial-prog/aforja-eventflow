import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, UserPlus, Trash2, XCircle, LayoutGrid, Network, Users, Layout, Phone, Briefcase, MapPin, Menu, MoreVertical, CheckCircle2 } from "lucide-react";

import { useState, useMemo } from "react";
import { toast } from "sonner";

import { useForja, useForjaMetrics } from "@/components/forja/store";
import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";
import { Avatar, EmptyState, FieldRow, PersonStatusBadge, WhatsappButton } from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const { responsibles, updateResponsible, addResponsible, removeResponsible, clearResponsibles, preferredTeamView } = useForja();
  const metrics = useForjaMetrics();

  const [editing, setEditing] = useState<Responsible | null>(null);
  const [filter, setFilter] = useState<"todos" | PersonStatus>("todos");
  
  // Only Columns view is supported now
  const view = "colunas";


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
        <div>
          <h1 className="text-2xl font-display font-bold">Responsáveis e Times</h1>
          <p className="text-sm text-muted-foreground">Organize os líderes e integrantes de cada time do evento.</p>
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
            <span className="hidden sm:inline">Novo time</span>
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
                Manual: Novo time
              </Button>
            </div>
          }
        />
      ) : (
        <ColumnView
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
            <DialogTitle className="font-display">Novo time</DialogTitle>
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
              Criar time
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
        title="Excluir time?"
        description={
          deleting?.name 
            ? `Tem certeza que deseja excluir a área "${deleting.area}"? Esta ação também removerá os dados do responsável (${deleting.name}) vinculados a esta área.`
            : `Tem certeza que deseja excluir a área "${deleting?.area}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel="Excluir time"
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

function MetricCard({ value, label, tone = "primary" }: { value: number; label: string; tone?: "primary" | "warning" }) {
  return (
    <div className="surface-card p-4 flex flex-col items-center justify-center text-center">
      <p className={cn(
        "text-2xl font-display font-black",
        tone === "primary" ? "text-primary" : "text-warning"
      )}>{value}</p>
      <p className="text-[10px] label-caps text-muted-foreground mt-1">{label}</p>
    </div>
  );
}


function ColumnView({
  responsibles,
  onEdit,
  onDelete,
}: {
  responsibles: Responsible[];
  onEdit: (r: Responsible) => void;
  onDelete: (r: Responsible) => void;
}) {
  const groups = useMemo(() => {
    const map: Record<string, Responsible[]> = {};
    RESPONSIBLE_SECTORS.forEach((s) => (map[s] = []));
    
    responsibles.forEach((r) => {
      const s = r.sector || "Outro";
      if (!map[s]) map[s] = [];
      map[s].push(r);
    });
    
    return Object.entries(map)
      .filter(([_, items]) => items.length > 0)
      .sort((a, b) => b[1].length - a[1].length);
  }, [responsibles]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 forja-scroll snap-x">
      {groups.map(([sector, items]) => (
        <div key={sector} className="min-w-[300px] max-w-[320px] flex flex-col gap-3 snap-start">
          <div className="flex items-center justify-between p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg">
            <h3 className="label-caps truncate max-w-[200px]" title={sector}>{sector}</h3>
            <span className="text-[10px] font-bold bg-primary-soft text-primary px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {items.map((r) => (
              <div 
                key={r.id} 
                className="surface-card p-3 shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={r.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate leading-tight">{r.name || "NÃO DEFINIDO"}</p>
                    <p className="text-[9px] label-caps text-primary/70 truncate">{r.area}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <PersonStatusBadge status={r.status} className="scale-75 origin-left" />
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="size-6" onClick={() => onEdit(r)}>
                      <Pencil className="size-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-6 text-destructive/70 hover:text-destructive" onClick={() => onDelete(r)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {groups.length === 0 && (
        <div className="w-full p-20 text-center surface-card border-dashed">
          <Layout className="size-8 mx-auto mb-3 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground text-sm">Nenhum setor com responsáveis cadastrados.</p>
        </div>
      )}
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
              <Label htmlFor="resp-area">Título da área / Posto</Label>
              <Input id="resp-area" maxLength={60} value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resp-sector">Setor / Time</Label>
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
