import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Plus, Radio, Search } from "lucide-react";
import { useState } from "react";

import forjaLogo from "@/assets/forja-logo.png.asset.json";
import { GlobalSearch } from "@/components/forja/GlobalSearch";
import { NewTaskSheet } from "@/components/forja/NewTaskSheet";
import { NAV_ITEMS, findNavItem } from "@/components/forja/nav";
import { useForja, useForjaMetrics } from "@/components/forja/store";
import { Avatar } from "@/components/forja/ui-kit";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-2 py-1">
      <img
        src={forjaLogo.url}
        alt="A Forja"
        className="h-8 w-auto max-w-[140px] shrink-0 object-contain drop-shadow-[0_0_18px_hsl(var(--primary)/0.25)]"
      />
      <span className="min-w-0 border-l border-border/60 pl-3">
        <span className="block text-[10px] font-medium leading-tight tracking-[0.16em] text-muted-foreground">
          EVENT
          <br />
          COMMAND CENTER
        </span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="forja-scroll flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
        >
          <item.icon className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function SidebarFooterCard() {
  const metrics = useForjaMetrics();
  return (
    <div className="m-3 rounded-xl border border-border bg-card p-3">
      <p className="label-caps">Saúde da Forja</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-primary tabular-nums">{metrics.health}%</p>
      <Link
        to="/modo-evento"
        className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary-soft px-3 py-2 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary/20"
      >
        <Radio className="size-3.5" />
        MODO EVENTO
      </Link>
    </div>
  );
}

function Notifications() {
  const metrics = useForjaMetrics();
  const alerts = [
    metrics.late.length > 0 && { text: `${metrics.late.length} tarefas atrasadas`, tone: "destructive" as const },
    metrics.dueToday.length > 0 && { text: `${metrics.dueToday.length} tarefas vencem hoje`, tone: "warning" as const },
    metrics.undefinedAreas.length > 0 && {
      text: `${metrics.undefinedAreas.length} áreas sem responsável`,
      tone: "destructive" as const,
    },
    metrics.unconfirmedSpeakers.length > 0 && {
      text: `${metrics.unconfirmedSpeakers.length} palestrante(s) não confirmado(s)`,
      tone: "warning" as const,
    },
    metrics.purchasesWithoutOwner.length > 0 && {
      text: `${metrics.purchasesWithoutOwner.length} compras sem responsável`,
      tone: "warning" as const,
    },
  ].filter(Boolean) as { text: string; tone: "warning" | "destructive" }[];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificações"
          className="relative grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-border-strong hover:text-foreground"
        >
          <Bell className="size-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {alerts.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 border-border bg-popover p-2">
        <p className="label-caps px-2 py-1.5">Notificações</p>
        <div className="space-y-1">
          {alerts.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted-foreground">Nada pendente. Forja em ordem.</p>
          )}
          {alerts.map((alert) => (
            <div key={alert.text} className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-card-hover">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  alert.tone === "destructive" ? "bg-destructive" : "bg-warning",
                )}
              />
              <span className="text-sm">{alert.text}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell() {
  const { event } = useForja();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = findNavItem(pathname);
  const countdown = useCountdown(event.date);
  const [searchOpen, setSearchOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* subtle ember glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-80 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 25% 0%, oklch(0.664 0.207 37.5 / 0.14), transparent 70%)",
        }}
      />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border px-3 py-4">
          <Brand />
        </div>
        <NavList />
        <SidebarFooterCard />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu"
                    className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground lg:hidden"
                  >
                    <Menu className="size-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="flex h-full flex-col">
                    <div className="border-b border-sidebar-border px-3 py-4">
                      <Brand />
                    </div>
                    <NavList onNavigate={() => setMobileOpen(false)} />
                    <SidebarFooterCard />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-bold sm:text-xl">{current.label}</h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{current.subtitle}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors duration-200 hover:border-border-strong hover:text-foreground md:flex"
              >
                <Search className="size-3.5" />
                Buscar
                <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </button>

              <span className="hidden rounded-lg border border-primary/25 bg-primary-soft px-3 py-2 text-xs font-semibold text-primary sm:inline-flex">
                {countdown.passed ? "É hoje!" : `${countdown.days} dias para A Forja`}
              </span>

              <Button size="sm" onClick={() => setTaskOpen(true)} className="gap-1.5">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Nova tarefa</span>
              </Button>

              <button
                type="button"
                aria-label="Buscar"
                onClick={() => setSearchOpen(true)}
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground md:hidden"
              >
                <Search className="size-4" />
              </button>

              <Notifications />
              <Avatar name="Henrique Alves" size="sm" />
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <NewTaskSheet open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  );
}
