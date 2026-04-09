import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { DirectionBadge } from '@/components/DirectionBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export default function TradeHistory() {
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [filterPair, setFilterPair] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterDirection, setFilterDirection] = useState('');

  const { data: trades, isLoading } = trpc.trades.getHistory.useQuery({ limit, offset });

  const filteredTrades = trades?.filter((trade: any) => {
    let matches = true;

    if (filterPair && !trade.pair.toLowerCase().includes(filterPair.toLowerCase())) {
      matches = false;
    }

    if (filterMode && trade.operationMode !== filterMode) {
      matches = false;
    }

    if (filterDirection && trade.direction !== filterDirection) {
      matches = false;
    }

    return matches;
  }) || [];

  const totalProfit = filteredTrades.reduce((sum: number, trade: any) => sum + parseFloat(trade.realizedPnL), 0);
  const winRate = filteredTrades.length > 0
    ? ((filteredTrades.filter((t: any) => parseFloat(t.realizedPnL) > 0).length / filteredTrades.length) * 100).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <div className="card-premium">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-card rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card-premium">
        <h3 className="text-lg font-bold text-foreground mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="stat-label mb-2 block">Par</label>
            <Input
              placeholder="BTC, ETH..."
              value={filterPair}
              onChange={(e) => setFilterPair(e.target.value)}
              className="input-premium"
            />
          </div>
          <div>
            <label className="stat-label mb-2 block">Modo</label>
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger className="input-premium">
                <SelectValue placeholder="Todos os modos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os modos</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Estratégico">Estratégico</SelectItem>
                <SelectItem value="Insano">Insano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="stat-label mb-2 block">Direção</label>
            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="input-premium">
                <SelectValue placeholder="Todas as direções" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as direções</SelectItem>
                <SelectItem value="Long">Long</SelectItem>
                <SelectItem value="Short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="stat-label mb-2 block">Limite</label>
            <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
              <SelectTrigger className="input-premium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium-sm">
          <p className="stat-label mb-2">Total de Trades</p>
          <p className="stat-value">{filteredTrades.length}</p>
        </div>
        <div className="card-premium-sm">
          <p className="stat-label mb-2">Lucro Total</p>
          <p className={`stat-value ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(totalProfit).toFixed(2)}
          </p>
        </div>
        <div className="card-premium-sm">
          <p className="stat-label mb-2">Taxa de Vitória</p>
          <p className="stat-value">{winRate}%</p>
        </div>
      </div>

      {/* Trade History Table */}
      <div className="card-premium">
        <h3 className="text-lg font-bold text-foreground mb-4">Histórico de Trades</h3>
        {filteredTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Par</th>
                  <th>Direção</th>
                  <th>Modo</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                  <th>Tamanho</th>
                  <th>P&L</th>
                  <th>Score</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade: any) => {
                  const pnl = parseFloat(trade.realizedPnL);
                  const isProfitable = pnl > 0;

                  return (
                    <tr key={trade.id}>
                      <td className="font-semibold text-foreground">{trade.pair}</td>
                      <td>
                        <DirectionBadge direction={trade.direction} />
                      </td>
                      <td>
                        <span className={`badge-mode ${trade.operationMode.toLowerCase()}`}>
                          {trade.operationMode}
                        </span>
                      </td>
                      <td className="text-muted-foreground">
                        ${parseFloat(trade.entryPrice).toFixed(2)}
                      </td>
                      <td className="text-muted-foreground">
                        ${parseFloat(trade.exitPrice).toFixed(2)}
                      </td>
                      <td className="text-foreground">{trade.positionSize}</td>
                      <td className={isProfitable ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        ${Math.abs(pnl).toFixed(2)}
                      </td>
                      <td className="text-foreground">{trade.score}</td>
                      <td className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(trade.closedAt).toLocaleDateString()}
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
            <p className="text-muted-foreground">Nenhum trade encontrado com os filtros selecionados</p>
          </div>
        )}

        {/* Pagination */}
        {filteredTrades.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {offset + 1} até {Math.min(offset + limit, offset + filteredTrades.length)} de {filteredTrades.length} trades
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= filteredTrades.length}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
