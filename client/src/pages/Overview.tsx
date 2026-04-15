import { trpc } from '@/lib/trpc';
import { StatCard } from '@/components/StatCard';
import { EquityCurve } from '@/components/EquityCurve';
import { LogsFeed } from '@/components/LogsFeed';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Overview() {
  const { data: config } = trpc.robot.getConfig.useQuery();
  const { data: positions } = trpc.positions.getOpen.useQuery();
  const { data: trades } = trpc.trades.getHistory.useQuery({ limit: 100 });
  const utils = trpc.useContext();

  const updateModeMutation = trpc.robot.updateMode.useMutation({
    onSuccess: () => {
      utils.robot.getConfig.invalidate();
    },
  });

  const totalPnL = trades?.reduce((sum: number, trade: any) => sum + parseFloat(trade.realizedPnL), 0) || 0;
  const winningTrades = trades?.filter((t: any) => parseFloat(t.realizedPnL) > 0).length || 0;
  const losingTrades = trades?.filter((t: any) => parseFloat(t.realizedPnL) < 0).length || 0;
  const winRate = trades && (trades as any[]).length > 0 ? ((winningTrades / (trades as any[]).length) * 100).toFixed(1) : 0;
  const avgWin = winningTrades > 0 ? ((trades?.filter((t: any) => parseFloat(t.realizedPnL) > 0).reduce((sum: number, t: any) => sum + parseFloat(t.realizedPnL), 0) || 0) / winningTrades) : 0;
  const avgLoss = losingTrades > 0 ? Math.abs(((trades?.filter((t: any) => parseFloat(t.realizedPnL) < 0).reduce((sum: number, t: any) => sum + parseFloat(t.realizedPnL), 0) || 0) / losingTrades)) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A';

  const openPositionsCount = positions?.length || 0;
  const openPositionsPnL = positions?.reduce((sum: number, pos: any) => sum + parseFloat(pos.unrealizedPnL), 0) || 0;

  const handleModeChange = async (newMode: string) => {
    try {
      await updateModeMutation.mutateAsync({ mode: newMode });
    } catch (error) {
      console.error('Erro ao mudar modo:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Visão Geral do Trading</h1>
        <p className="text-muted-foreground">Resumo de desempenho e estatísticas do robô</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total P&L"
          value={`$${Math.abs(totalPnL).toFixed(2)}`}
          change={totalPnL}
          icon={totalPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        />
        <StatCard
          label="Taxa de Vitória"
          value={`${winRate}%`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="Posições Abertas"
          value={openPositionsCount}
          change={openPositionsPnL}
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard
          label="Profit Factor"
          value={typeof profitFactor === 'string' ? profitFactor : parseFloat(profitFactor).toFixed(2)}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Equity Curve */}
      <EquityCurve />

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Statistics */}
        <Card className="card-premium">
          <h3 className="text-lg font-bold text-foreground mb-6">Estatísticas de Trades</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Total de Trades</span>
              <span className="text-lg font-bold text-foreground">{trades?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Trades Vencedores</span>
              <span className="text-lg font-bold text-green-400">{winningTrades}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Trades Perdedores</span>
              <span className="text-lg font-bold text-red-400">{losingTrades}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Ganho Médio</span>
              <span className="text-lg font-bold text-green-400">${avgWin.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Perda Média</span>
              <span className="text-lg font-bold text-red-400">${avgLoss.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Robot Configuration */}
        <Card className="card-premium">
          <h3 className="text-lg font-bold text-foreground mb-6">Configuração do Robô</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-bold ${config?.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {config?.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Modo de Operação</span>
              <div className="flex items-center gap-2">
                <select
                  value={config?.operationMode || 'Normal'}
                  onChange={(e) => handleModeChange(e.target.value)}
                  disabled={updateModeMutation.isLoading}
                  className="bg-background border border-border rounded-md px-3 py-1 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                >
                  <option value="Normal">Normal (1H)</option>
                  <option value="Estratégico">Estratégico (15min)</option>
                  <option value="Insano">Insano (5min)</option>
                </select>
                {updateModeMutation.isLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Risco por Trade</span>
              <span className="font-bold text-foreground">{config?.riskPercentage}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Alavancagem Máxima</span>
              <span className="font-bold text-foreground">{config?.maxLeverage}x</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Saldo da Conta</span>
              <span className="font-bold text-accent">${parseFloat(config?.accountBalance || '0').toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Logs */}
      <LogsFeed limit={20} />
    </div>
  );
}
