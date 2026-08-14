import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeamBuilderWizard } from "./useTeamBuilderWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function TeamBuilderWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const wizard = useTeamBuilderWizard();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface">
        <DialogHeader>
          <DialogTitle>Team Builder — Assistente de Equipe</DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px] py-4">
          {wizard.step === 1 && (
            <div className="space-y-4">
              <Label>Quantos convidados são esperados?</Label>
              <Input 
                type="number" 
                value={wizard.data.attendeeCount} 
                onChange={(e) => wizard.updateData({ attendeeCount: parseInt(e.target.value) || 0 })} 
              />
              <Button onClick={wizard.nextStep} className="w-full">Próximo</Button>
            </div>
          )}

          {wizard.step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Estrutura Sugerida</h3>
              <div className="h-64 overflow-y-auto space-y-2">
                {wizard.recommendations.map(r => (
                  <div key={r.id} className="p-3 border border-border rounded-lg">
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={wizard.resetWizard}>Reiniciar</Button>
                <Button onClick={() => {
                  wizard.applyRecommendations();
                  onOpenChange(false);
                }} className="flex-1">Aplicar Estrutura</Button>
              </div>
            </div>
          )}
          
          {wizard.isAnalyzing && <p className="text-center animate-pulse">Analisando necessidades do seu evento...</p>}
          {!wizard.isAnalyzing && wizard.step === 1 && <p className="text-muted-foreground text-sm">Passo 1/4</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
