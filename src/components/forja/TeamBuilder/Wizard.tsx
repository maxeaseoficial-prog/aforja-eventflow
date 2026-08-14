import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeamBuilderWizard } from "./useTeamBuilderWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Layout, Zap, Rocket, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  "Recepção", "Credenciamento", "Som", "Iluminação", "Palco", "Palestrantes", 
  "Fotografia", "Vídeo", "Redes sociais / Stories", "Coffee break", "Buffet / Refeição", 
  "Bar", "Segurança", "Limpeza", "Expositores / Estandes", "Área VIP", 
  "Acessibilidade / apoio especial", "Montagem e desmontagem", "Telão / Projeção", "Transmissão ao vivo"
];

export function TeamBuilderWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const wizard = useTeamBuilderWizard();
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth transition for step 4
  useEffect(() => {
    if (wizard.isAnalyzing) {
      setIsAnimating(true);
    }
  }, [wizard.isAnalyzing]);

  const toggleOption = (opt: string) => {
    const current = wizard.data.selectedOptions;
    if (current.includes(opt)) {
      wizard.updateData({ selectedOptions: current.filter(o => o !== opt) });
    } else {
      wizard.updateData({ selectedOptions: [...current, opt] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-surface border-primary/20 p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col h-full">
          {/* Header Progress */}
          <div className="bg-card/50 border-b border-border p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Rocket className="size-5 text-primary" />
                  Team Builder
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Configuração inteligente de equipe de evento</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Passo {wizard.step} de 4</span>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map(s => (
                    <div 
                      key={s} 
                      className={cn(
                        "h-1 w-6 rounded-full transition-all duration-500",
                        wizard.step >= s ? "bg-primary" : "bg-border"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {wizard.step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary-soft text-primary mb-2">
                    <Users className="size-5" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Qual o tamanho do público?</h2>
                  <p className="text-muted-foreground">O número de convidados define a escala base de suporte e recepção.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base">Número de convidados esperados</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="Ex: 500"
                        className="pl-10 h-12 text-lg font-medium"
                        value={wizard.data.attendeeCount || ""} 
                        onChange={(e) => wizard.updateData({ attendeeCount: parseInt(e.target.value) || 0 })} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Layout do Evento</Label>
                    <Select value={wizard.data.layout} onValueChange={(v) => wizard.updateData({ layout: v })}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Um único ambiente">Um único ambiente (Auditório/Salão)</SelectItem>
                        <SelectItem value="Vários ambientes">Vários ambientes / Salas simultâneas</SelectItem>
                        <SelectItem value="Evento externo">Evento externo / Área aberta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={wizard.nextStep} 
                    className="w-full h-12 text-base font-bold gap-2"
                    disabled={!wizard.data.attendeeCount}
                  >
                    Continuar <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {wizard.step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary-soft text-primary mb-2">
                    <Zap className="size-5" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">O que terá no evento?</h2>
                  <p className="text-muted-foreground">Selecione todos os serviços e experiências que serão oferecidos.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {OPTIONS.map(opt => (
                    <div 
                      key={opt}
                      onClick={() => toggleOption(opt)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                        wizard.data.selectedOptions.includes(opt) 
                          ? "border-primary bg-primary-soft/30 text-primary shadow-sm" 
                          : "border-border hover:border-primary/30 hover:bg-card/50"
                      )}
                    >
                      <div className={cn(
                        "size-5 rounded border flex items-center justify-center transition-colors",
                        wizard.data.selectedOptions.includes(opt) ? "bg-primary border-primary" : "border-border bg-card"
                      )}>
                        {wizard.data.selectedOptions.includes(opt) && <CheckCircle2 className="size-3 text-card" />}
                      </div>
                      <span className="text-sm font-medium">{opt}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={wizard.prevStep} className="h-12 px-6">
                    <ChevronLeft className="size-4" /> Voltar
                  </Button>
                  <Button 
                    onClick={wizard.nextStep} 
                    className="flex-1 h-12 text-base font-bold gap-2"
                    disabled={wizard.data.selectedOptions.length === 0}
                  >
                    Próximo <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {wizard.step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary-soft text-primary mb-2">
                    <Layout className="size-5" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Nível de Complexidade</h2>
                  <p className="text-muted-foreground">Ajuste os detalhes finais para calibrar a quantidade de pessoas por área.</p>
                </div>

                <div className="space-y-6">
                  {wizard.data.selectedOptions.includes("Palco") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantidade de Palcos</Label>
                        <Input 
                          type="number" 
                          min={1} 
                          value={wizard.data.stages} 
                          onChange={(e) => wizard.updateData({ stages: parseInt(e.target.value) || 1 })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Palestrantes / Atrações</Label>
                        <Input 
                          type="number" 
                          value={wizard.data.speakers} 
                          onChange={(e) => wizard.updateData({ speakers: parseInt(e.target.value) || 0 })} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Duração do Evento</Label>
                    <Select value={wizard.data.duration} onValueChange={(v) => wizard.updateData({ duration: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Até 3 horas">Até 3 horas (Curta)</SelectItem>
                        <SelectItem value="Meio período">Meio período (4-6 horas)</SelectItem>
                        <SelectItem value="Dia inteiro">Dia inteiro (8+ horas)</SelectItem>
                        <SelectItem value="Mais de um dia">Mais de um dia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {wizard.data.selectedOptions.includes("Credenciamento") && (
                    <div className="space-y-2">
                      <Label>Tipo de Credenciamento</Label>
                      <Select value={wizard.data.registrationType} onValueChange={(v) => wizard.updateData({ registrationType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lista simples">Lista simples (Manual)</SelectItem>
                          <SelectItem value="QR Code / digital">QR Code / App Digital</SelectItem>
                          <SelectItem value="Inscrição no local">Inscrição/Venda no local</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={wizard.prevStep} className="h-12 px-6">
                    <ChevronLeft className="size-4" /> Voltar
                  </Button>
                  <Button 
                    onClick={wizard.startAnalysis} 
                    className="flex-1 h-12 text-base font-bold gap-2 bg-primary shadow-lg shadow-primary/20"
                  >
                    <Sparkles className="size-4" /> Gerar Recomendação
                  </Button>
                </div>
              </div>
            )}

            {wizard.step === 4 && (
              <div className="space-y-6 animate-fade-in h-full">
                {wizard.isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <div className="relative size-16 rounded-full bg-primary-soft flex items-center justify-center">
                        <Loader2 className="size-8 text-primary animate-spin" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-display font-bold">Analisando sua estrutura...</h3>
                      <p className="text-muted-foreground text-sm">O motor da FORJA está escalando as equipes necessárias.</p>
                    </div>
                    <div className="w-full max-w-xs bg-border h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full animate-loading-bar" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-display font-bold flex items-center gap-2">
                          <CheckCircle2 className="size-5 text-success" />
                          Estrutura Encontrada
                        </h3>
                        <p className="text-sm text-muted-foreground">Baseado no seu perfil de evento ({wizard.data.attendeeCount} pax).</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-secondary text-xs font-bold border border-border">
                        {wizard.recommendations.length} NÚCLEOS SUGERIDOS
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {wizard.recommendations.map(r => (
                        <div key={r.id} className="p-4 border border-border rounded-2xl bg-card/40 hover:border-primary/20 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                              r.category === "essential" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                            )}>
                              {r.category === "essential" ? "Crítico" : "Recomendado"}
                            </span>
                            {r.isVenueProvided && <span className="text-[10px] text-muted-foreground italic">Fornecido pelo local</span>}
                          </div>
                          <h4 className="font-bold text-sm">{r.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">{r.leaderRole}</span>
                            {r.memberRoles.length > 0 && r.memberRoles[0] && (
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(3, r.memberRoles[0].count))].map((_, i) => (
                                  <div key={i} className="size-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] font-bold">
                                    {i === 2 && r.memberRoles[0] && r.memberRoles[0].count > 3 ? `+${r.memberRoles[0].count - 2}` : ""}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border mt-auto">
                      <Button variant="ghost" onClick={wizard.resetWizard} className="h-12 px-6">
                        Reiniciar
                      </Button>
                      <Button 
                        onClick={() => {
                          wizard.applyRecommendations();
                          onOpenChange(false);
                        }} 
                        className="flex-1 h-12 text-base font-bold gap-2 bg-primary shadow-lg shadow-primary/30"
                      >
                        Aplicar Estrutura <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
