import { useState } from 'react';
import { BybitExecuteTrade } from '@/components/BybitExecuteTrade';
import { BybitPositions } from '@/components/BybitPositions';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export default function Trading() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: balance, isLoading: balanceLoading } = trpc.bybit.getBalance.useQuery();
  const { data: marketInfo } = trpc.bybit.getMarketInfo.useQuery({ symbol: 'BTCUSDT' });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trading</h1>
          <p className="text-muted-foreground">Gerencie suas posições e execute trades em tempo real</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Saldo */}
          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-2">Saldo Total</div>
            {balanceLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                ${typeof balance?.totalBalance === 'string' ? parseFloat(balance.totalBalance).toFixed(2) : '0.00'}
              </div>
            )}
          </Card>

          {/* Preço BTC */}
          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-2">Preço BTC/USDT</div>
            {marketInfo ? (
              <div>
                <div className="text-2xl font-bold text-foreground">${marketInfo.lastPrice.toFixed(2)}</div>
                <div className={`text-sm ${marketInfo.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {marketInfo.change24h >= 0 ? '+' : ''}{(marketInfo.change24h * 100).toFixed(2)}% (24h)
                </div>
              </div>
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </Card>

          {/* Volume 24h */}
          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-2">Volume 24h</div>
            {marketInfo ? (
              <div className="text-2xl font-bold text-foreground">
                ${(marketInfo.volume24h / 1000000).toFixed(2)}M
              </div>
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </Card>
        </div>

        {/* Trading Section */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="positions">Posições Abertas</TabsTrigger>
            <TabsTrigger value="execute">Executar Trade</TabsTrigger>
          </TabsList>

          {/* Posições Abertas */}
          <TabsContent value="positions" className="space-y-4">
            <div key={refreshKey}>
              <BybitPositions />
            </div>
          </TabsContent>

          {/* Executar Trade */}
          <TabsContent value="execute" className="space-y-4">
            <BybitExecuteTrade />
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <Card className="mt-8 p-6 bg-accent/10 border-accent/20">
          <h3 className="font-bold text-foreground mb-2">💡 Dica</h3>
          <p className="text-sm text-muted-foreground">
            Use a aba "Posições Abertas" para monitorar seus trades em tempo real. Clique em "Fechar Posição" para encerrar uma posição.
            Use a aba "Executar Trade" para criar novos trades com Market ou Limit orders.
          </p>
        </Card>
      </div>
    </div>
  );
}
