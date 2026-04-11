import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EquityCurveProps {
  data?: Array<{
    timestamp: number;
    balance: number;
  }>;
  isLoading?: boolean;
}

export function EquityCurve({ data = [], isLoading = false }: EquityCurveProps) {
  // Generate sample data if none provided
  const chartData = data.length > 0 ? data : generateSampleData();

  const minBalance = Math.min(...chartData.map(d => d.balance));
  const maxBalance = Math.max(...chartData.map(d => d.balance));
  const currentBalance = chartData[chartData.length - 1]?.balance || 0;
  const initialBalance = chartData[0]?.balance || 0;
  const change = currentBalance - initialBalance;
  const changePercent = initialBalance > 0 ? (change / initialBalance) * 100 : 0;

  if (isLoading) {
    return (
      <div className="card-premium h-80 animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Curva de Equity</h3>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Saldo Atual</p>
          <p className={`text-2xl font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${currentBalance.toFixed(2)}
          </p>
          <p className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="timestamp"
            stroke="rgba(255,255,255,0.3)"
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Saldo']}
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={change >= 0 ? '#4ade80' : '#f87171'}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Saldo Mínimo</p>
          <p className="text-lg font-bold text-foreground">${minBalance.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Saldo Máximo</p>
          <p className="text-lg font-bold text-foreground">${maxBalance.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Variação</p>
          <p className={`text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(change).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function generateSampleData() {
  const data = [];
  let balance = 10000;
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.48) * 500;
    balance = Math.max(balance + change, 5000);
    data.push({
      timestamp: now - (30 - i) * 24 * 60 * 60 * 1000,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return data;
}
