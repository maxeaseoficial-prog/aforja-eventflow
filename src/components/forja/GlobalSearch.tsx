import { useNavigate } from "@tanstack/react-router";
import { CalendarClock, ClipboardList, Mic, ShoppingCart, UserCog, Users } from "lucide-react";
import { useEffect } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useForja } from "@/components/forja/store";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { tasks, responsibles, speakers, purchases, staff, schedule } = useForja();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Busca global" description="Buscar em toda a Forja">
      <CommandInput placeholder="Buscar tarefas, pessoas, compras, programação..." />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        <CommandGroup heading="Tarefas">
          {tasks.slice(0, 30).map((task) => (
            <CommandItem key={task.id} value={`tarefa ${task.title} ${task.owner}`} onSelect={() => go("/tarefas")}>
              <ClipboardList className="size-4 text-primary" />
              <span className="truncate">{task.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{task.owner}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Responsáveis">
          {responsibles.map((r) => (
            <CommandItem key={r.id} value={`responsavel ${r.area} ${r.name ?? ""}`} onSelect={() => go("/responsaveis")}>
              <UserCog className="size-4 text-primary" />
              <span className="truncate">{r.area}</span>
              <span className="ml-auto text-xs text-muted-foreground">{r.name ?? "Não definido"}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Palestrantes">
          {speakers.map((s) => (
            <CommandItem key={s.id} value={`palestrante ${s.name} ${s.talkTitle}`} onSelect={() => go("/palestrantes")}>
              <Mic className="size-4 text-primary" />
              <span className="truncate">{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.talkTime}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Compras">
          {purchases.slice(0, 30).map((p) => (
            <CommandItem key={p.id} value={`compra ${p.item}`} onSelect={() => go("/compras")}>
              <ShoppingCart className="size-4 text-primary" />
              <span className="truncate">{p.item}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Staff">
          {staff.map((s) => (
            <CommandItem key={s.id} value={`staff ${s.name} ${s.area}`} onSelect={() => go("/staff")}>
              <Users className="size-4 text-primary" />
              <span className="truncate">{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.area}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Programação">
          {schedule.map((s) => (
            <CommandItem key={s.id} value={`programacao ${s.time} ${s.title}`} onSelect={() => go("/programacao")}>
              <CalendarClock className="size-4 text-primary" />
              <span className="truncate">{s.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.time}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
