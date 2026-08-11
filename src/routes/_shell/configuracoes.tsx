import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save, Smartphone, Download, CheckCircle2, MonitorDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useForja } from "@/components/forja/store";
import { usePWAStore } from "@/hooks/use-pwa";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { deferredPrompt, isInstallable, isInstalled } = usePWAStore();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

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

  const handleInstall = async () => {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // Diagnostic logging as requested
    console.log("PWA_INSTALL_DIAGNOSTICS", {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isProd: import.meta.env.PROD,
      serviceWorkerSupported: "serviceWorker" in navigator,
      serviceWorkerRegistered: Boolean(await navigator.serviceWorker.getRegistration()),
      displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
      deferredPromptAvailable: Boolean(deferredPrompt),
      isInstalled
    });
    
    if (isIOS && !isInstalled) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      if (!isInstalled) {
        toast.info("A instalação automática não está disponível neste navegador. Certifique-se de estar usando Chrome ou Edge e aguarde o carregamento do Service Worker.");
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
  };

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
                date: form.date ? `${form.date}T${form.doorsAt || "19:00"}:00` : "",
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

      <Panel title="Aplicativo" description="Instalação PWA">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-soft shadow-inner">
              <img src="/favicon.png" alt="A Forja" className="size-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">A Forja — Aplicativo</h3>
              <p className="text-sm text-muted-foreground">
                Instale o Event Command Center neste dispositivo para acessá-lo como um aplicativo independente.
              </p>
            </div>
          </div>

          <div>
            {isInstalled ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500">
                <CheckCircle2 className="size-4" />
                Aplicativo instalado
              </div>
            ) : (
              <Button onClick={handleInstall} className="w-full gap-2 sm:w-auto">
                <MonitorDown className="size-4" />
                Instalar aplicativo
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
          <DialogContent className="max-w-sm border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Instalar A Forja</DialogTitle>
              <DialogDescription className="pt-2 text-foreground">
                Para instalar este aplicativo no seu iPhone ou iPad:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
                <p className="text-sm">Toque no botão <strong>Compartilhar</strong> do Safari (ícone de quadrado com seta para cima).</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</div>
                <p className="text-sm">Role a lista e escolha <strong>“Adicionar à Tela de Início”</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</div>
                <p className="text-sm">Confirme clicando em <strong>“Adicionar”</strong> no topo da tela.</p>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <Button onClick={() => setShowIOSInstructions(false)}>Entendi</Button>
            </div>
          </DialogContent>
        </Dialog>
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
