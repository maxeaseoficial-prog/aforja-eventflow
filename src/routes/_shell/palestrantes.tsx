import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, Mic } from "lucide-react";
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
import { SPEAKER_CHECKLIST, type PersonStatus } from "@/lib/forja-data";
import { cn } from "@/lib/utils";

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
  const { speakers, toggleSpeakerStep, updateSpeaker } = useForja();
  const [openId, setOpenId] = useState<string | null>(speakers[0]?.id ?? null);

  return (
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
