import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, Calendar, Settings, ArrowRight, Clock, MapPin, LogOut } from "lucide-react";
import { useState } from "react";
import { useForja } from "@/components/forja/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";


import forjaLogo from "@/assets/forja-logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: EventSelector,
});

function EventSelector() {
  const { events = [], addEvent, selectEvent } = useForja();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    venue: "",
  });


  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.date) return;
    addEvent({
      ...newEvent,
      id: crypto.randomUUID(),
    });
    setIsNewEventOpen(false);
    setNewEvent({ name: "", date: "", venue: "" });
  };


  const handleSelectEvent = (id: string) => {
    selectEvent(id);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-40"
        style={{
          background: "radial-gradient(100% 100% at 50% 0%, oklch(0.79 0.12 85 / 0.15), transparent 80%)",
        }}
      />

      <header className="relative z-10 p-6 flex items-center justify-between container mx-auto">
        <Link to="/">
          <img src={forjaLogo.url} alt="A Forja" className="h-10 w-auto object-contain cursor-pointer" />
        </Link>

        <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground gap-2"
            onClick={() => {
                logout();
                navigate({ to: "/login" });
            }}
          >
            <LogOut className="size-4" />
            Sair
          </Button>

      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-display font-black tracking-tight text-foreground mb-2 uppercase italic">
                Eventos
              </h1>
              <p className="text-muted-foreground">Selecione ou crie um novo centro de comando.</p>
            </div>

            <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 gap-2 text-base font-bold uppercase italic tracking-wide">
                  <Plus className="size-5" />
                  Criar Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display font-bold uppercase italic tracking-wide">Novo Evento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider opacity-60">Nome do Evento</Label>
                    <Input
                      id="name"
                      placeholder="Ex: A Forja 2026"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date" className="text-xs uppercase font-bold tracking-wider opacity-60">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="venue" className="text-xs uppercase font-bold tracking-wider opacity-60">Local</Label>
                    <Input
                      id="venue"
                      placeholder="Ex: Expo Center Norte"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, venue: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsNewEventOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateEvent} disabled={!newEvent.name || !newEvent.date}>
                    Criar Centro de Comando
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {events.length === 0 ? (
            <div className="bg-card/30 border border-dashed border-border rounded-2xl p-20 flex flex-col items-center justify-center text-center">
              <div className="size-16 rounded-full bg-primary-soft/30 flex items-center justify-center mb-6 text-primary">
                <Calendar className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Comece criando seu primeiro evento para acessar o painel de comando.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleSelectEvent(event.id)}
                  className="group relative flex flex-col items-start p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="size-5 text-primary" />
                  </div>
                  
                  <div className="mb-4 inline-flex items-center justify-center size-10 rounded-lg bg-primary-soft text-primary font-bold">
                    {event.name.charAt(0).toUpperCase()}
                  </div>

                  <h3 className="text-xl font-display font-bold uppercase italic tracking-wide group-hover:text-primary transition-colors mb-4 line-clamp-1">
                    {event.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <Clock className="size-3.5" />
                      {format(new Date(event.date + "T12:00:00"), "dd MMM, yyyy", { locale: ptBR })}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <MapPin className="size-3.5" />
                        {event.venue}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-xs text-muted-foreground/40 uppercase tracking-[0.2em] font-bold">
        A Forja — Event Command Center &copy; 2026
      </footer>
    </div>
  );
}
