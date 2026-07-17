import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';

export function TechnicalIndicators() {
  const [prices, setPrices] = useState<string>('');
  const [selectedIndicators, setSelectedIndicators] = useState<
    Array<'RSI' | 'SMA' | 'EMA' | 'MACD' | 'BB'>
  >(['RSI', 'SMA', 'MACD']);

  const calculateQuery = trpc.strategies.calculateIndicators.useQuery(
    { prices: [], indicators: selectedIndicators },
    { enabled: false }
  );
  const [calculatedData, setCalculatedData] = useState<any>(null);

  const handleCalculate = async () => {
    const priceArray = prices
      .split(',')
      .map((p) => parseFloat(p.trim()))
      .filter((p) => !isNaN(p));

    if (priceArray.length < 2) {
      alert('Por favor, insira pelo menos 2 preços separados por vírgula');
      return;
    }

    try {
      const result = await fetch('/api/trpc/strategies.calculateIndicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prices: priceArray,
          indicators: selectedIndicators,
        }),
      }).then((r) => r.json());
      setCalculatedData(result.result?.data);
    } catch (error) {
      console.error('Erro ao calcular indicadores:', error);
    }
  };

  const toggleIndicator = (indicator: 'RSI' | 'SMA' | 'EMA' | 'MACD' | 'BB') => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator) ? prev.filter((i) => i !== indicator) : [...prev, indicator]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Indicadores Técnicos
        </CardTitle>
        <CardDescription>Calcule indicadores técnicos para análise de preços</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prices">Preços (separados por vírgula)</Label>
          <Input
            id="prices"
            placeholder="100.5, 101.2, 99.8, 102.1, 103.5"
            value={prices}
            onChange={(e) => setPrices(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Indicadores a Calcular:</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(['RSI', 'SMA', 'EMA', 'MACD', 'BB'] as const).map((indicator) => (
              <Button
                key={indicator}
                variant={selectedIndicators.includes(indicator) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleIndicator(indicator)}
              >
                {indicator}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calcular Indicadores
        </Button>

        {calculatedData && (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <h4 className="font-semibold">Resultados:</h4>
            <div className="space-y-2 text-sm">
              {calculatedData.rsi && (
                <div className="flex justify-between">
                  <span>RSI (14):</span>
                  <span className="font-mono font-semibold">{calculatedData.rsi.toFixed(2)}</span>
                </div>
              )}
              {calculatedData.sma20 && (
                <div className="flex justify-between">
                  <span>SMA (20):</span>
                  <span className="font-mono font-semibold">
                    {calculatedData.sma20.toFixed(2)}
                  </span>
                </div>
              )}
              {calculatedData.sma50 && (
                <div className="flex justify-between">
                  <span>SMA (50):</span>
                  <span className="font-mono font-semibold">
                    {calculatedData.sma50.toFixed(2)}
                  </span>
                </div>
              )}
              {calculatedData.ema12 && (
                <div className="flex justify-between">
                  <span>EMA (12):</span>
                  <span className="font-mono font-semibold">
                    {calculatedData.ema12.toFixed(2)}
                  </span>
                </div>
              )}
              {calculatedData.ema26 && (
                <div className="flex justify-between">
                  <span>EMA (26):</span>
                  <span className="font-mono font-semibold">
                    {calculatedData.ema26.toFixed(2)}
                  </span>
                </div>
              )}
              {calculatedData.macd && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>MACD:</span>
                    <span className="font-mono font-semibold">
                      {calculatedData.macd.macd.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signal:</span>
                    <span className="font-mono font-semibold">
                      {calculatedData.macd.signal.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Histogram:</span>
                    <span className="font-mono font-semibold">
                      {calculatedData.macd.histogram.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
              {calculatedData.bollingerBands && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>BB Upper:</span>
                    <span className="font-mono font-semibold">
                      {calculatedData.bollingerBands.upper.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>BB Middle:</span>
                    <span className="font-mono font-semibold">
                      {calculatedData.bollingerBands.middle.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>BB Lower:</span>
                    <span className="font-mono font-semibold">
                      {calculatedData.bollingerBands.lower.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


      </CardContent>
    </Card>
  );
}
