/**
 * Trading Strategies Module
 * Suporta múltiplas estratégias de trading
 */

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'mean-reversion' | 'breakout' | 'scalping' | 'custom';
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal?: 'buy' | 'sell' | 'neutral';
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: number;
}

// Estratégia de Momentum
export const momentumStrategy: Strategy = {
  id: 'momentum',
  name: 'Momentum Strategy',
  description: 'Compra quando o preço sobe com força e vende quando perde força',
  type: 'momentum',
  enabled: true,
  parameters: {
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    macdFastPeriod: 12,
    macdSlowPeriod: 26,
    macdSignalPeriod: 9,
  },
};

// Estratégia de Mean Reversion
export const meanReversionStrategy: Strategy = {
  id: 'mean-reversion',
  name: 'Mean Reversion Strategy',
  description: 'Compra quando o preço está abaixo da média móvel e vende quando está acima',
  type: 'mean-reversion',
  enabled: true,
  parameters: {
    smaShortPeriod: 20,
    smaLongPeriod: 50,
    bollingerBandsPeriod: 20,
    bollingerBandsStdDev: 2,
  },
};

// Estratégia de Breakout
export const breakoutStrategy: Strategy = {
  id: 'breakout',
  name: 'Breakout Strategy',
  description: 'Compra quando o preço quebra níveis de resistência',
  type: 'breakout',
  enabled: true,
  parameters: {
    lookbackPeriod: 20,
    breakoutThreshold: 0.02, // 2%
    volumeMultiplier: 1.5,
  },
};

// Estratégia de Scalping
export const scalpingStrategy: Strategy = {
  id: 'scalping',
  name: 'Scalping Strategy',
  description: 'Realiza múltiplos trades pequenos para lucrar com pequenas variações de preço',
  type: 'scalping',
  enabled: true,
  parameters: {
    profitTarget: 0.005, // 0.5%
    stopLoss: 0.003, // 0.3%
    timeframe: '1m',
    maxHoldTime: 300000, // 5 minutos em ms
  },
};

export const defaultStrategies: Strategy[] = [
  momentumStrategy,
  meanReversionStrategy,
  breakoutStrategy,
  scalpingStrategy,
];

/**
 * Calcular RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral if not enough data

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

/**
 * Calcular SMA (Simple Moving Average)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calcular EMA (Exponential Moving Average)
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }

  return ema;
}

/**
 * Calcular Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } {
  const sma = calculateSMA(prices, period);

  const squaredDiffs = prices
    .slice(-period)
    .map((price) => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const standardDeviation = Math.sqrt(variance);

  return {
    upper: sma + stdDev * standardDeviation,
    middle: sma,
    lower: sma - stdDev * standardDeviation,
  };
}

/**
 * Calcular MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  const macd = emaFast - emaSlow;

  // Para simplificar, usamos SMA do MACD como sinal
  const macdValues = [];
  for (let i = Math.max(fastPeriod, slowPeriod); i < prices.length; i++) {
    const fast = calculateEMA(prices.slice(0, i + 1), fastPeriod);
    const slow = calculateEMA(prices.slice(0, i + 1), slowPeriod);
    macdValues.push(fast - slow);
  }

  const signal = calculateSMA(macdValues, signalPeriod);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Gerar sinal de trading baseado em múltiplos indicadores
 */
export function generateTradingSignal(
  prices: number[],
  strategy: Strategy
): TechnicalIndicator[] {
  const indicators: TechnicalIndicator[] = [];
  const now = Date.now();

  if (strategy.type === 'momentum') {
    const rsi = calculateRSI(prices, strategy.parameters.rsiPeriod);
    indicators.push({
      name: 'RSI',
      value: rsi,
      signal:
        rsi > strategy.parameters.rsiOverbought
          ? 'sell'
          : rsi < strategy.parameters.rsiOversold
            ? 'buy'
            : 'neutral',
      timestamp: now,
    });

    const macd = calculateMACD(
      prices,
      strategy.parameters.macdFastPeriod,
      strategy.parameters.macdSlowPeriod,
      strategy.parameters.macdSignalPeriod
    );
    indicators.push({
      name: 'MACD',
      value: macd.histogram,
      signal: macd.histogram > 0 ? 'buy' : 'sell',
      timestamp: now,
    });
  } else if (strategy.type === 'mean-reversion') {
    const smaShort = calculateSMA(prices, strategy.parameters.smaShortPeriod);
    const smaLong = calculateSMA(prices, strategy.parameters.smaLongPeriod);
    const currentPrice = prices[prices.length - 1];

    indicators.push({
      name: 'SMA',
      value: smaShort,
      signal: currentPrice < smaShort ? 'buy' : currentPrice > smaShort ? 'sell' : 'neutral',
      timestamp: now,
    });

    const bb = calculateBollingerBands(
      prices,
      strategy.parameters.bollingerBandsPeriod,
      strategy.parameters.bollingerBandsStdDev
    );
    indicators.push({
      name: 'Bollinger Bands',
      value: currentPrice,
      signal: currentPrice < bb.lower ? 'buy' : currentPrice > bb.upper ? 'sell' : 'neutral',
      timestamp: now,
    });
  }

  return indicators;
}
