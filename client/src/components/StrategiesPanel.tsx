import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle } from 'lucide-react';

export function StrategiesPanel() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const { data: strategies, isLoading, error } = trpc.strategies.getAvailableStrategies.useQuery();
  const { data: userStrategies } = trpc.strategies.getUserStrategies.useQuery();
  const toggleMutation = trpc.strategies.toggleStrategy.useMutation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estratégias de Trading</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            Erro ao carregar estratégias
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-700">{error.message}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Estratégias de Trading</CardTitle>
          <CardDescription>Selecione e configure suas estratégias de trading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {strategies?.map((strategy) => {
            const isEnabled =
              userStrategies?.find((s) => s.id === strategy.id)?.enabled ?? strategy.enabled;

            return (
              <div
                key={strategy.id}
                className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{strategy.name}</h3>
                    <Badge variant={isEnabled ? 'default' : 'secondary'}>
                      {isEnabled ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">{strategy.type}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    Configurar
                  </Button>
                  <Button
                    variant={isEnabled ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() =>
                      toggleMutation.mutate({
                        strategyId: strategy.id,
                        enabled: !isEnabled,
                      })
                    }
                    disabled={toggleMutation.isPending}
                  >
                    {toggleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEnabled ? (
                      'Desativar'
                    ) : (
                      'Ativar'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedStrategy && (
        <StrategyConfigPanel
          strategyId={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
        />
      )}
    </div>
  );
}

function StrategyConfigPanel({
  strategyId,
  onClose,
}: {
  strategyId: string;
  onClose: () => void;
}) {
  const { data: strategies } = trpc.strategies.getAvailableStrategies.useQuery();
  const strategy = strategies?.find((s) => s.id === strategyId);

  if (!strategy) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar: {strategy.name}</CardTitle>
        <CardDescription>Ajuste os parâmetros da estratégia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Parâmetros Atuais:</h4>
          <div className="rounded-lg bg-muted p-4">
            <pre className="text-sm">{JSON.stringify(strategy.parameters, null, 2)}</pre>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </CardContent>
    </Card>
  );
}
