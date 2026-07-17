import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, Bell, Trash2 } from 'lucide-react';

export function PriceAlerts() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [price, setPrice] = useState('');

  const { data: alerts, isLoading, refetch } = trpc.strategies.getPriceAlerts.useQuery();
  const createMutation = trpc.strategies.createPriceAlert.useMutation();
  const deleteMutation = trpc.strategies.deletePriceAlert.useMutation();

  const handleCreate = () => {
    const priceValue = parseFloat(price);
    if (!symbol || !price || isNaN(priceValue)) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    createMutation.mutate(
      {
        symbol,
        condition,
        price: priceValue,
      },
      {
        onSuccess: () => {
          setPrice('');
          refetch();
        },
      }
    );
  };

  const handleDelete = (alertId: string) => {
    deleteMutation.mutate(
      { alertId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Criar Alerta de Preço
          </CardTitle>
          <CardDescription>Configure alertas para ser notificado sobre mudanças de preço</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="symbol">Símbolo</Label>
              <Input
                id="symbol"
                placeholder="BTCUSDT"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                placeholder="50000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condição</Label>
            <Select value={condition} onValueChange={(value) => setCondition(value as 'above' | 'below')}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Acima de</SelectItem>
                <SelectItem value="below">Abaixo de</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Alerta'
            )}
          </Button>

          {createMutation.error && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{createMutation.error.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Alertas</CardTitle>
          <CardDescription>
            {alerts?.length === 0 ? 'Nenhum alerta criado' : `${alerts?.length} alerta(s) ativo(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="font-semibold">
                      {alert.symbol} - {alert.condition === 'above' ? '≥' : '≤'} ${alert.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Criado em {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(alert.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Nenhum alerta criado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
