import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { Panel } from "@/components/forja/ui-kit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl } from "@/lib/forja-data";

export const Route = createFileRoute("/_shell/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — FORJA Event Command Center" },
      { name: "description", content: "Parâmetros da edição da Forja: data, local, orçamento e público esperado." },
      { property: "og:title", content: "Configurações — FORJA" },
      { property: "og:description", content: "Ajuste os dados centrais que alimentam todo o painel de comando." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { event, updateEvent, resetAll } = useForja();
  const [form, setForm] = useState({
    name: event.name || "",
    edition: event.edition || "",
    date: event.date ? event.date.slice(0, 10) : "",
    doorsAt: event.doorsAt || "",
    venue: event.venue || "",
    address: event.address || "",
    whatsapp: event.whatsapp || "",
    instagram: event.instagram || "",
    budget: String(event.budget || 0),
    expectedGuests: String(event.expectedGuests || 0),
  });

  return (
    <div className="space-y-6">
      <Panel title="Dados da edição" description="Usados no countdown, no orçamento e nas métricas do dashboard">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { key: "name" as const, label: "Nome do evento", type: "text" },
            { key: "edition" as const, label: "Edição", type: "text" },
            { key: "date" as const, label: "Data", type: "date" },
            { key: "doorsAt" as const, label: "Abertura das portas", type: "time" },
            { key: "venue" as const, label: "Local", type: "text" },
            { key: "address" as const, label: "Endereço", type: "text" },
            { key: "whatsapp" as const, label: "WhatsApp oficial", type: "text" },
            { key: "instagram" as const, label: "Instagram", type: "text" },
            { key: "budget" as const, label: "Orçamento (R$)", type: "number" },
            { key: "expectedGuests" as const, label: "Público esperado", type: "number" },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type}
                maxLength={80}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            className="gap-1.5"
            onClick={() => {
              if (form.name.trim().length < 2) {
                toast.error("Informe o nome do evento.");
                return;
              }
              updateEvent({
                name: form.name.trim(),
                edition: form.edition.trim(),
                date: `${form.date}T${form.doorsAt || "19:00"}:00-03:00`,
                doorsAt: form.doorsAt,
                venue: form.venue.trim(),
                address: form.address.trim(),
                whatsapp: form.whatsapp.trim(),
                instagram: form.instagram.trim(),
                budget: Number(form.budget) || 0,
                expectedGuests: Number(form.expectedGuests) || 0,
              });
              toast.success("Configurações salvas");
            }}
          >
            <Save className="size-4" /> Salvar
          </Button>
          <span className="text-xs text-muted-foreground">
            Orçamento atual: {brl(event.budget)} · {event.expectedGuests} convidados
          </span>
        </div>
      </Panel>


      <Panel title="Dados" description="Tudo é salvo no seu navegador e pronto para migrar para o banco de dados">
        <p className="text-sm text-muted-foreground">
          A estrutura de dados já está modelada por módulo (tarefas, compras, staff, palestrantes, estrutura,
          contingências), então a migração para persistência em nuvem é direta.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-4 gap-1.5">
              <RotateCcw className="size-4" /> Restaurar dados iniciais
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-surface">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Restaurar dados iniciais?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as alterações feitas neste navegador serão perdidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetAll();
                  toast.success("Dados restaurados");
                }}
              >
                Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Panel>
    </div>
  );
}
