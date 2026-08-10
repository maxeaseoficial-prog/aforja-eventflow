import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { useForja } from "@/components/forja/store";
import { Avatar, EmptyState, Panel, PersonStatusBadge, WhatsappButton } from "@/components/forja/ui-kit";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAFF_AREAS, type PersonStatus } from "@/lib/forja-data";

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
  const { staff, updateStaff } = useForja();
  const [area, setArea] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6">
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
            <article key={member.id} className="surface-card surface-card-hover animate-fade-up p-5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <Avatar name={member.name} size="lg" />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-bold">{member.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{member.role}</p>
                </div>
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
    </div>
  );
}
