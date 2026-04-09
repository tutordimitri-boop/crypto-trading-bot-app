import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type OperationMode = 'Normal' | 'Estratégico' | 'Insano';

interface ModeSelectorProps {
  currentMode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  disabled?: boolean;
}

const MODES = [
  {
    name: 'Normal',
    focus: 'Futuros',
    timeframe: '1 Hora',
    strategy: 'Tendência sólida e movimentos macro.',
    description: 'Modo conservador focado em tendências de longo prazo',
  },
  {
    name: 'Estratégico',
    focus: 'Spot',
    timeframe: '15 Minutos',
    strategy: 'Acumulação de ativos e swing trades curtos.',
    description: 'Modo equilibrado para acumulação e swing trades',
  },
  {
    name: 'Insano',
    focus: 'Futuros',
    timeframe: '5 Minutos',
    strategy: 'Scalping agressivo em alta volatilidade.',
    description: 'Modo agressivo para scalping de alta frequência',
  },
] as const;

export function ModeSelector({ currentMode, onModeChange, disabled = false }: ModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<OperationMode>(currentMode);

  const currentModeData = MODES.find((m) => m.name === currentMode);
  const selectedModeData = MODES.find((m) => m.name === selectedMode);

  const handleConfirm = () => {
    onModeChange(selectedMode);
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        variant="outline"
        className="w-full justify-start"
      >
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Modo Atual</span>
          <span className="font-semibold">{currentMode}</span>
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Modo de Operação</DialogTitle>
            <DialogDescription>
              Escolha o modo que melhor se adequa à sua estratégia de trading
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {MODES.map((mode) => (
              <button
                key={mode.name}
                onClick={() => setSelectedMode(mode.name as OperationMode)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedMode === mode.name
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{mode.name}</h3>
                  <span className="text-xs text-muted-foreground">{mode.timeframe}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{mode.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Foco: {mode.focus}</span>
                  <span>Estratégia: {mode.strategy}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedModeData && (
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Detalhes do Modo Selecionado:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Foco:</span> {selectedModeData.focus}
                </p>
                <p>
                  <span className="text-muted-foreground">Timeframe:</span> {selectedModeData.timeframe}
                </p>
                <p>
                  <span className="text-muted-foreground">Estratégia:</span> {selectedModeData.strategy}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={selectedMode === currentMode}>
              Aplicar Modo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
