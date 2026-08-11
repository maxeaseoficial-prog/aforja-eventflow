import { createFileRoute } from "@tanstack/react-router";
import { Users, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { Avatar, EmptyState, Panel, PersonStatusBadge, WhatsappButton } from "@/components/forja/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { STAFF_AREAS, type PersonStatus, type StaffMember } from "@/lib/forja-data";

export const Route = createFileRoute("/_shell/staff")({
  head: () => ({
    meta: [
      { title: "Staff — FORJA Event Command Center" },
      { name: "description", content: "Equipe operacional da Forja: áreas, funções, horários de chegada e contatos." },
      { property: "og:title", content: "Staff — FORJA" },
      { property: "og:description", content: "Escala completa do staff por área, com status de confirmação." },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const { staff, updateStaff, addStaff, removeStaff } = useForja();
  const [area, setArea] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      staff.filter((member) => {
        if (area !== "todas" && member.area !== area) return false;
        if (status !== "todos" && member.status !== status) return false;
        if (search && !member.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [staff, area, status, search],
  );

  const byArea = STAFF_AREAS.map((name) => ({
    name,
    count: staff.filter((member) => member.area === name).length,
  })).filter((entry) => entry.count > 0);

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMember: StaffMember = {
      id: crypto.randomUUID(),
      name: formData.get("name") as string,
      whatsapp: formData.get("whatsapp") as string,
      area: formData.get("area") as string,
      role: formData.get("role") as string,
      reportsTo: formData.get("reportsTo") as string,
      arrival: formData.get("arrival") as string,
      status: "pendente",
      notes: formData.get("notes") as string,
    };

    addStaff(newMember);
    setIsAddModalOpen(false);
    toast.success("Membro do staff adicionado!");
  };

  const memberToDelete = staff.find(s => s.id === deleteId);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff</h1>
          <p className="text-sm text-muted-foreground">Gerencie a equipe operacional e voluntários.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95">
              <Plus className="size-4" />
              Adicionar Staff
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-primary/20 bg-surface">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">Novo Membro do Staff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" name="name" required className="bg-background/50" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" placeholder="55..." required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival">Horário de Chegada</Label>
                  <Input id="arrival" name="arrival" type="time" required className="bg-background/50" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Select name="area" required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_AREAS.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Input id="role" name="role" required className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportsTo">Responsável Direto</Label>
                <Input id="reportsTo" name="reportsTo" placeholder="Quem coordena?" className="bg-background/50" />
              </div>
              <DialogFooter className="pt-4">
                <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                  Cadastrar Staff
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {byArea.length > 0 && (
        <Panel title="Distribuição por área">
          <div className="flex flex-wrap gap-2">
            {byArea.map((entry) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => setArea(area === entry.name ? "todas" : entry.name)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200 " +
                  (area === entry.name
                    ? "border-primary/30 bg-primary-soft text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground")
                }
              >
                {entry.name} · {entry.count}
              </button>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        <Input placeholder="Buscar pessoa..." maxLength={60} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as áreas</SelectItem>
            {STAFF_AREAS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="indefinido">Indefinido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro nesse filtro"
          description="Ajuste os filtros para ver a escala do staff da Forja."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => (
            <article key={member.id} className="surface-card surface-card-hover animate-fade-up group relative p-5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <Avatar name={member.name} size="lg" />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-bold">{member.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{member.role}</p>
                </div>
                <button
                  onClick={() => setDeleteId(member.id)}
                  className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg border border-destructive/20 text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Área</dt>
                  <dd className="font-medium">{member.area}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Responsável direto</dt>
                  <dd className="truncate font-medium">{member.reportsTo}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Chegada</dt>
                  <dd className="font-medium tabular-nums">{member.arrival}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <PersonStatusBadge status={member.status} />
                <WhatsappButton number={member.whatsapp} />
                <Select
                  value={member.status}
                  onValueChange={(v) => updateStaff(member.id, { status: v as PersonStatus })}
                >
                  <SelectTrigger className="ml-auto h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="indefinido">Indefinido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            removeStaff(deleteId);
            setDeleteId(null);
            toast.success("Membro removido do staff!");
          }
        }}
        title="Remover Staff"
        itemName={memberToDelete?.name}
      />
    </div>
  );
}
