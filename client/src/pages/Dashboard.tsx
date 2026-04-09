import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { StatCard } from '@/components/StatCard';
import { RobotStatusBadge } from '@/components/RobotStatusBadge';
import { ModeSelector } from '@/components/ModeSelector';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, Zap } from 'lucide-react';

type OperationMode = 'Normal' | 'Estratégico' | 'Insano';

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [robotConfig, setRobotConfig] = useState<any>(null);

  const { data: config } = trpc.robot.getConfig.useQuery();
  const { data: positions } = trpc.positions.getOpen.useQuery();
  const { data: logs } = trpc.logs.getLogs.useQuery({ limit: 10 });

  const updateModeMutation = trpc.robot.updateMode.useMutation();
  const toggleActiveMutation = trpc.robot.toggleActive.useMutation();

  useEffect(() => {
    if (config) {
      setRobotConfig(config);
      setIsLoading(false);
    }
  }, [config]);

  const handleModeChange = (mode: OperationMode) => {
    updateModeMutation.mutate(mode, {
      onSuccess: () => {
        setRobotConfig((prev: any) => ({ ...prev, operationMode: mode }));
      },
    });
  };

  const handleToggleActive = () => {
    const newState = !robotConfig?.isActive;
    toggleActiveMutation.mutate(newState, {
      onSuccess: () => {
        setRobotConfig((prev: any) => ({ ...prev, isActive: newState }));
      },
    });
  };

  if (isLoading || !robotConfig) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-card rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pnlValue = parseFloat(robotConfig.totalPnL || '0');
  const pnlChange = pnlValue >= 0 ? pnlValue : -Math.abs(pnlValue);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Crypto Trading Bot
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerenciamento de robô de trading automatizado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <RobotStatusBadge 
                isActive={robotConfig.isActive === 1} 
                mode={robotConfig.operationMode as OperationMode}
              />
              <Button
                onClick={handleToggleActive}
                disabled={updateModeMutation.isPending || toggleActiveMutation.isPending}
                variant={robotConfig.isActive === 1 ? 'default' : 'outline'}
                className="btn-premium"
              >
                {robotConfig.isActive === 1 ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 sm:py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Saldo da Conta"
            value={`$${parseFloat(robotConfig.accountBalance || '0').toFixed(2)}`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            label="P&L Total"
            value={`$${Math.abs(pnlChange).toFixed(2)}`}
            change={pnlChange}
            icon={pnlChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          />
          <StatCard
            label="Total de Trades"
            value={robotConfig.totalTrades || 0}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <StatCard
            label="Risco por Trade"
            value={`${robotConfig.riskPercentage}%`}
            icon={<Zap className="w-5 h-5" />}
          />
        </div>

        {/* Configuration Section */}
        <div className="card-premium mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Configuração do Robô</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="stat-label mb-3 block">Modo de Operação</label>
              <ModeSelector
                currentMode={robotConfig.operationMode as OperationMode}
                onModeChange={handleModeChange}
                disabled={updateModeMutation.isPending}
              />
            </div>
            <div>
              <label className="stat-label mb-3 block">Alavancagem Máxima</label>
              <div className="input-premium bg-card/50 text-muted-foreground">
                {robotConfig.maxLeverage}x
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="positions">Posições Abertas</TabsTrigger>
            <TabsTrigger value="trades">Histórico</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Open Positions Tab */}
          <TabsContent value="positions" className="card-premium">
            <h3 className="text-lg font-bold text-foreground mb-4">Posições Abertas</h3>
            {positions && positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead>
                    <tr>
                      <th>Par</th>
                      <th>Direção</th>
                      <th>Tamanho</th>
                      <th>Entrada</th>
                      <th>Preço Atual</th>
                      <th>P&L</th>
                      <th>Stop Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos: any) => (
                      <tr key={pos.id}>
                        <td className="font-semibold">{pos.pair}</td>
                        <td>
                          <span className={`badge-direction ${pos.direction.toLowerCase()}`}>
                            {pos.direction}
                          </span>
                        </td>
                        <td>{pos.positionSize}</td>
                        <td>${parseFloat(pos.entryPrice).toFixed(2)}</td>
                        <td>${parseFloat(pos.currentPrice).toFixed(2)}</td>
                        <td className={parseFloat(pos.unrealizedPnL) >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${parseFloat(pos.unrealizedPnL).toFixed(2)}
                        </td>
                        <td>${parseFloat(pos.stopLoss).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma posição aberta no momento
              </p>
            )}
          </TabsContent>

          {/* Trade History Tab */}
          <TabsContent value="trades" className="card-premium">
            <h3 className="text-lg font-bold text-foreground mb-4">Histórico de Trades</h3>
            <p className="text-muted-foreground text-center py-8">
              Histórico de trades será exibido aqui
            </p>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="card-premium">
            <h3 className="text-lg font-bold text-foreground mb-4">Feed de Logs</h3>
            {logs && logs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
                    <span className={`badge-log ${log.level}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground break-words">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum log disponível
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
