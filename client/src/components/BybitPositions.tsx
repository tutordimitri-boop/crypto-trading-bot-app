import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { DirectionBadge } from '@/components/DirectionBadge';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export function BybitPositions() {
  const { data: positions, isLoading, refetch } = trpc.bybit.getOpenPositions.useQuery({
    category: 'linear',
  });

  const closePositionMutation = trpc.bybit.closePosition.useMutation({
    onSuccess: () => {
      toast.success('Posição fechada com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao fechar posição');
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">Posições Abertas (Bybit)</h3>

      {positions && positions.length > 0 ? (
        <div className="space-y-3">
          {positions.map((pos) => {
            const pnlPercent = typeof pos.unrealizedPnLPercent === 'string' ? parseFloat(pos.unrealizedPnLPercent) : pos.unrealizedPnLPercent;
            const pnlValue = typeof pos.unrealizedPnL === 'string' ? parseFloat(pos.unrealizedPnL) : pos.unrealizedPnL;
            const isProfit = pnlValue >= 0;

            return (
              <Card key={pos.symbol} className="p-4 bg-card/50 border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground text-base">{pos.symbol}</span>
                        <DirectionBadge direction={pos.side as 'Long' | 'Short'} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pos.leverage}x alavancagem
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold text-base ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      ${pnlValue.toFixed(2)}
                    </div>
                    <div className={`text-xs ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-background/50 p-2 rounded">
                    <div className="text-muted-foreground">Tamanho</div>
                    <div className="text-foreground font-mono">{typeof pos.size === 'string' ? parseFloat(pos.size).toFixed(4) : pos.size.toFixed(4)}</div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="text-muted-foreground">Entrada</div>
                    <div className="text-foreground font-mono">${typeof pos.entryPrice === 'string' ? parseFloat(pos.entryPrice).toFixed(2) : pos.entryPrice.toFixed(2)}</div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="text-muted-foreground">Marca</div>
                    <div className="text-foreground font-mono">${typeof pos.markPrice === 'string' ? parseFloat(pos.markPrice).toFixed(2) : pos.markPrice.toFixed(2)}</div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="text-muted-foreground">Stop Loss</div>
                    <div className="text-foreground font-mono">
                      {pos.stopLoss ? `$${parseFloat(pos.stopLoss.toString()).toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    closePositionMutation.mutate({
                      symbol: pos.symbol,
                      side: (pos.side as string) === 'Long' ? 'Buy' : 'Sell',
                    });
                  }}
                  disabled={closePositionMutation.isPending}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  {closePositionMutation.isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Fechando...
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Fechar Posição
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma posição aberta</p>
        </div>
      )}
    </Card>
  );
}
