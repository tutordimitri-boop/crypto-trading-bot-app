import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { DirectionBadge } from '@/components/DirectionBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit2 } from 'lucide-react';

export default function OpenTrades() {
  const { data: positions, isLoading } = trpc.positions.getOpen.useQuery();
  const [filterPair, setFilterPair] = useState('');

  const filteredPositions = positions?.filter((pos: any) =>
    pos.pair.toLowerCase().includes(filterPair.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="card-premium">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-card rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-premium">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-foreground">Posições Abertas</h2>
          <Input
            placeholder="Filtrar por par (ex: BTC/ETH)..."
            value={filterPair}
            onChange={(e) => setFilterPair(e.target.value)}
            className="input-premium sm:max-w-xs"
          />
        </div>

        {filteredPositions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Par</th>
                  <th>Direção</th>
                  <th>Tamanho</th>
                  <th>Preço Entrada</th>
                  <th>Preço Atual</th>
                  <th>P&L Não Realizado</th>
                  <th>Stop Loss</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((position: any) => {
                  const pnl = parseFloat(position.unrealizedPnL);
                  const isProfitable = pnl >= 0;

                  return (
                    <tr key={position.id}>
                      <td className="font-semibold text-foreground">{position.pair}</td>
                      <td>
                        <DirectionBadge direction={position.direction} />
                      </td>
                      <td className="text-foreground">{position.positionSize}</td>
                      <td className="text-muted-foreground">
                        ${parseFloat(position.entryPrice).toFixed(2)}
                      </td>
                      <td className="text-foreground">
                        ${parseFloat(position.currentPrice).toFixed(2)}
                      </td>
                      <td className={isProfitable ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        ${Math.abs(pnl).toFixed(2)}
                      </td>
                      <td className="text-muted-foreground">
                        ${parseFloat(position.stopLoss).toFixed(2)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Ajustar Stop Loss"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:text-red-400"
                            title="Fechar Posição"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {filterPair ? 'Nenhuma posição encontrada para este par' : 'Nenhuma posição aberta no momento'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredPositions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-premium-sm">
            <p className="stat-label mb-2">Total de Posições</p>
            <p className="stat-value">{filteredPositions.length}</p>
          </div>
          <div className="card-premium-sm">
            <p className="stat-label mb-2">P&L Total</p>
            <p className="stat-value text-green-400">
              ${filteredPositions
                .reduce((sum: number, pos: any) => sum + parseFloat(pos.unrealizedPnL), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="card-premium-sm">
            <p className="stat-label mb-2">Posições Lucrativas</p>
            <p className="stat-value">
              {filteredPositions.filter((pos: any) => parseFloat(pos.unrealizedPnL) >= 0).length} / {filteredPositions.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
