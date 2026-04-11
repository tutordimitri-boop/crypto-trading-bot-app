import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function BybitExecuteTrade() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState('Buy');
  const [orderType, setOrderType] = useState('Market');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const executeTradeMutation = trpc.bybit.executeTrade.useMutation();
  const utils = trpc.useUtils();

  const handleExecute = async () => {
    if (!symbol || !qty) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await executeTradeMutation.mutateAsync({
        symbol,
        side: side as 'Buy' | 'Sell',
        orderType: orderType as 'Market' | 'Limit',
        qty: parseFloat(qty),
        price: orderType === 'Limit' && price ? parseFloat(price) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      });

      toast.success('Trade executado com sucesso!');
      
      // Limpar formulário
      setQty('1');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
      
      // Invalidar queries
      utils.bybit.getOpenPositions.invalidate();
      utils.bybit.getBalance.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao executar trade');
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Executar Trade</h3>

      <div className="space-y-4">
        {/* Par */}
        <div>
          <Label className="stat-label">Par</Label>
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTCUSDT"
            className="input-premium mt-1"
          />
        </div>

        {/* Direção */}
        <div>
          <Label className="stat-label">Direção</Label>
          <Select value={side} onValueChange={setSide}>
            <SelectTrigger className="input-premium mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buy">Long</SelectItem>
              <SelectItem value="Sell">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Ordem */}
        <div>
          <Label className="stat-label">Tipo de Ordem</Label>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger className="input-premium mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Market">Market</SelectItem>
              <SelectItem value="Limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quantidade */}
        <div>
          <Label className="stat-label">Quantidade</Label>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="1"
            className="input-premium mt-1"
            step="0.01"
          />
        </div>

        {/* Preço (Limit) */}
        {orderType === 'Limit' && (
          <div>
            <Label className="stat-label">Preço</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="input-premium mt-1"
              step="0.01"
            />
          </div>
        )}

        {/* Stop Loss */}
        <div>
          <Label className="stat-label">Stop Loss (Opcional)</Label>
          <Input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="0.00"
            className="input-premium mt-1"
            step="0.01"
          />
        </div>

        {/* Take Profit */}
        <div>
          <Label className="stat-label">Take Profit (Opcional)</Label>
          <Input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="0.00"
            className="input-premium mt-1"
            step="0.01"
          />
        </div>

        {/* Botão Executar */}
        <Button
          onClick={handleExecute}
          disabled={executeTradeMutation.isPending}
          className="btn-premium btn-premium-primary w-full mt-6"
        >
          {executeTradeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            `Executar ${side === 'Buy' ? 'Long' : 'Short'}`
          )}
        </Button>
      </div>
    </Card>
  );
}
