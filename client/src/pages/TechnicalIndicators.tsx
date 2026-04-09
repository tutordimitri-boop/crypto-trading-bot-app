import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

export default function TechnicalIndicators() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const { data: indicators, isLoading } = trpc.indicators.get.useQuery({ pair: selectedPair });

  const pairs = ['BTC/USDT', 'ETH/USDT', 'BTC/USDC', 'ETH/USDC'];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 70) return 'bg-green-500/10';
    if (score >= 0) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card-premium h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pair Selector */}
      <div className="card-premium">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="stat-label">Selecionar Par</label>
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="input-premium sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pairs.map((pair) => (
                <SelectItem key={pair} value={pair}>
                  {pair}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SMC Score */}
      <div className={`card-premium ${getScoreBackground(indicators?.smcScore || 0)}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="stat-label mb-2">Score SMC (Smart Money Concepts)</p>
            <p className={`text-5xl font-bold ${getScoreColor(indicators?.smcScore || 0)}`}>
              {indicators?.smcScore || 0}
            </p>
          </div>
          <TrendingUp className={`w-12 h-12 ${getScoreColor(indicators?.smcScore || 0)}`} />
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Escala: -100 (Venda) até +100 (Compra)</span>
            <span className={`text-sm font-semibold ${indicators?.smcScore! >= 70 ? 'text-green-400' : 'text-muted-foreground'}`}>
              {indicators?.smcScore! >= 70 ? 'Sinal de Compra Forte' : indicators?.smcScore! >= 0 ? 'Sinal Neutro' : 'Sinal de Venda'}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Signals */}
      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
          <TabsTrigger value="signals">Sinais Técnicos</TabsTrigger>
          <TabsTrigger value="levels">Níveis de Preço</TabsTrigger>
        </TabsList>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-4">
          {/* BOS Signal */}
          <Card className="card-premium">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-foreground">BOS (Break of Structure)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identificação de quebra de estrutura de mercado
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                indicators?.bosDetected ? 'bg-blue-500/20 text-blue-400' : 'bg-muted/20 text-muted-foreground'
              }`}>
                {indicators?.bosDetected ? 'Detectado' : 'Não Detectado'}
              </div>
            </div>
          </Card>

          {/* CHoCH Signal */}
          <Card className="card-premium">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-foreground">CHoCH (Change of Character)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identificação de mudança de caráter do mercado
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                indicators?.chochDetected ? 'bg-purple-500/20 text-purple-400' : 'bg-muted/20 text-muted-foreground'
              }`}>
                {indicators?.chochDetected ? 'Detectado' : 'Não Detectado'}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          {/* FVG Signal */}
          <Card className="card-premium">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-foreground">FVG (Fair Value Gaps)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Desequilíbrios de preço e gaps de valor justo
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                indicators?.fvgActive ? 'bg-orange-500/20 text-orange-400' : 'bg-muted/20 text-muted-foreground'
              }`}>
                {indicators?.fvgActive ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </Card>

          {/* Order Blocks */}
          <Card className="card-premium">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-foreground">Order Blocks</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Blocos de ordem institucional identificados
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                indicators?.orderBlocksActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-muted/20 text-muted-foreground'
              }`}>
                {indicators?.orderBlocksActive ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <div className="card-premium">
        <h3 className="text-lg font-bold text-foreground mb-4">Resumo de Indicadores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-card/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Sinais Ativos</p>
            <p className="text-2xl font-bold text-accent">
              {(indicators?.bosDetected ? 1 : 0) + (indicators?.chochDetected ? 1 : 0) + (indicators?.fvgActive ? 1 : 0) + (indicators?.orderBlocksActive ? 1 : 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Modo</p>
            <p className="text-lg font-bold text-foreground">{indicators?.operationMode}</p>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Última Atualização</p>
            <p className="text-sm font-bold text-foreground">
              {indicators?.updatedAt ? new Date(indicators.updatedAt).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Par</p>
            <p className="text-lg font-bold text-foreground">{selectedPair}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
