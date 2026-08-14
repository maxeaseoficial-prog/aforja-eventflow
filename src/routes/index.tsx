import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Plus, Calendar, Settings, ArrowRight, Clock, MapPin, LogOut, Trash2, Edit2 } from "lucide-react";
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

import { ConfirmDeleteDialog } from "@/components/forja/ConfirmDeleteDialog";

export const Route = createFileRoute("/")({
  component: EventSelector,
});

function EventSelector() {
  const { events = [], addEvent, selectEvent, removeEvent, updateEvent } = useForja();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

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

  const handleUpdateEvent = () => {
    if (!editingEvent?.name || !editingEvent?.date) return;
    
    // We need to select the event temporarily to use updateEvent from store (which is scoped)
    // or we could add a root updateEvent to store.
    // For now, let's just use the store's setState directly or trigger select then update.
    // Actually, store.tsx already handles updating the event list if name/date changes inside updateEvent.
    // But updateEvent requires currentEventId.
    
    selectEvent(editingEvent.id);
    setTimeout(() => {
      updateEvent({
        name: editingEvent.name,
        date: editingEvent.date,
        venue: editingEvent.venue
      });
      // Deselect after update so we stay in selector
      selectEvent(null);
      setEditingEvent(null);
    }, 0);
  };

  const handleDeleteEvent = () => {
    if (deletingEventId) {
      removeEvent(deletingEventId);
      setDeletingEventId(null);
      toast.success("Evento excluído com sucesso");
    }
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
                <div
                  key={event.id}
                  className="group relative flex flex-col items-start p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="size-8 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingEventId(event.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  
                  <div 
                    className="w-full cursor-pointer"
                    onClick={() => handleSelectEvent(event.id)}
                  >
                    <div className="mb-4 inline-flex items-center justify-center size-10 rounded-lg bg-primary-soft text-primary font-bold">
                      {event.name.charAt(0).toUpperCase()}
                    </div>

                    <h3 className="text-xl font-display font-bold uppercase italic tracking-wide group-hover:text-primary transition-colors mb-4 line-clamp-1">
                      {event.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <Clock className="size-3.5" />
                        {(() => {
                          try {
                            return format(new Date(event.date + (event.date.includes("T") ? "" : "T12:00:00")), "dd MMM, yyyy", { locale: ptBR });
                          } catch (e) {
                            return "Data não definida";
                          }
                        })()}
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          <MapPin className="size-3.5" />
                          {event.venue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
          <DialogContent className="bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold uppercase italic tracking-wide">Editar Evento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-xs uppercase font-bold tracking-wider opacity-60">Nome do Evento</Label>
                <Input
                  id="edit-name"
                  value={editingEvent?.name || ""}
                  onChange={(e) => setEditingEvent((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date" className="text-xs uppercase font-bold tracking-wider opacity-60">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingEvent?.date?.split('T')[0] || ""}
                  onChange={(e) => setEditingEvent((prev: any) => ({ ...prev, date: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-venue" className="text-xs uppercase font-bold tracking-wider opacity-60">Local</Label>
                <Input
                  id="edit-venue"
                  value={editingEvent?.venue || ""}
                  onChange={(e) => setEditingEvent((prev: any) => ({ ...prev, venue: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingEvent(null)}>Cancelar</Button>
              <Button onClick={handleUpdateEvent}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDeleteDialog
          open={!!deletingEventId}
          onOpenChange={(open) => !open && setDeletingEventId(null)}
          onConfirm={handleDeleteEvent}
          title="Excluir Evento?"
          description="Tem certeza que deseja excluir este evento? Todos os dados associados a este centro de comando serão removidos permanentemente."
        />
      </main>

      <footer className="relative z-10 p-8 text-center text-xs text-muted-foreground/40 uppercase tracking-[0.2em] font-bold">
        A Forja — Event Command Center &copy; 2026
      </footer>
    </div>
  );
}
