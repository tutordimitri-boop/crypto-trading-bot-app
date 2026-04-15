import { db } from './db';
import { tradingConfig, trades } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { BybitClient } from './bybit/client';
import { bybit } from './bybit/client';

let activeInterval: NodeJS.Timeout | null = null;
let currentMode: string = 'Normal';

// Função principal que executa um ciclo de trading
async function tradingCycle() {
  try {
    // 1. Verifica se o robô ainda está ativo
    const config = await db.select().from(tradingConfig).limit(1);
    if (!config.length || !config[0].isActive) {
      stopTradingEngine();
      return;
    }

    // 2. Obtém modo atual (pode ter mudado)
    const mode = config[0].operationMode;
    if (mode !== currentMode) {
      // Reinicia o motor com o novo intervalo
      currentMode = mode;
      stopTradingEngine();
      await startTradingEngine();
      return;
    }

    // 3. Busca dados de mercado (exemplo: BTCUSDT)
    const symbol = 'BTCUSDT';
    const klineData = await bybit.getKline({
      category: 'linear',
      symbol,
      interval: getKlineInterval(mode),
      limit: 100,
    });
    if (!klineData.result?.list) return;
    const prices = klineData.result.list.map((candle: any) => parseFloat(candle[4])); // close price
    const currentPrice = prices[prices.length - 1];

    // 4. Calcula sinal conforme o modo
    let signal: 'buy' | 'sell' | null = null;
    if (mode === 'Normal') {
      const ema9 = calculateEMA(prices, 9);
      const ema21 = calculateEMA(prices, 21);
      const lastEma9 = ema9[ema9.length - 1];
      const lastEma21 = ema21[ema21.length - 1];
      const prevEma9 = ema9[ema9.length - 2];
      const prevEma21 = ema21[ema21.length - 2];
      if (prevEma9 <= prevEma21 && lastEma9 > lastEma21) signal = 'buy';
      else if (prevEma9 >= prevEma21 && lastEma9 < lastEma21) signal = 'sell';
    }
    else if (mode === 'Estratégico') {
      const rsi = calculateRSI(prices, 14);
      const lastRsi = rsi[rsi.length - 1];
      if (lastRsi < 30) signal = 'buy';
      else if (lastRsi > 70) signal = 'sell';
    }
    else if (mode === 'Insano') {
      const { lower } = calculateBollingerBands(prices, 20, 2);
      const lastLower = lower[lower.length - 1];
      if (currentPrice <= lastLower) signal = 'buy';
      // Poderia também vender no topo, mas para simplificar só compra
    }

    // 5. Executa ordem se houver sinal e não houver posição aberta
    if (signal) {
      const positions = await bybit.getPositionInfo({ category: 'linear', symbol });
      const openPositions = positions.result?.list?.filter((p: any) => parseFloat(p.size) > 0) || [];
      if (openPositions.length === 0) {
        const qty = await calculateOrderQuantity(config[0]);
        await bybit.submitOrder({
          category: 'linear',
          symbol,
          side: signal === 'buy' ? 'Buy' : 'Sell',
          orderType: 'Market',
          qty: qty.toString(),
        });
        // Registrar trade no banco (opcional)
        console.log(`✅ Ordem executada: ${signal} ${qty} ${symbol} @ ${currentPrice}`);
      }
    }
  } catch (error) {
    console.error('Erro no ciclo de trading:', error);
  }
}

// Exporta funções para serem usadas pelas rotas
export async function startTradingEngine() {
  if (activeInterval) stopTradingEngine();
  const config = await db.select().from(tradingConfig).limit(1);
  if (!config.length || !config[0].isActive) return;
  currentMode = config[0].operationMode;
  const intervalMs = getIntervalMs(currentMode);
  console.log(`🚀 Motor iniciado no modo ${currentMode} (a cada ${intervalMs/1000}s)`);
  activeInterval = setInterval(tradingCycle, intervalMs);
}

export function stopTradingEngine() {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
    console.log('⏹️ Motor parado');
  }
}

export async function restartTradingEngine() {
  stopTradingEngine();
  await startTradingEngine();
}

// --- Funções auxiliares (mantidas) ---
function getIntervalMs(mode: string): number {
  if (mode === 'Normal') return 60 * 60 * 1000;
  if (mode === 'Estratégico') return 15 * 60 * 1000;
  return 5 * 60 * 1000;
}

function getKlineInterval(mode: string): string {
  if (mode === 'Normal') return '60';
  if (mode === 'Estratégico') return '15';
  return '5';
}

function calculateEMA(prices: number[], period: number): number[] {
  const multiplier = 2 / (period + 1);
  const ema = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    ema.push((prices[i] - ema[i-1]) * multiplier + ema[i-1]);
  }
  return ema;
}

function calculateRSI(prices: number[], period: number): number[] {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i-1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / avgLoss;
  let rsi = [100 - (100 / (1 + rs))];
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i-1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
    rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number) {
  const upper = [], lower = [];
  for (let i = period-1; i < prices.length; i++) {
    const slice = prices.slice(i-period+1, i+1);
    const mean = slice.reduce((a,b) => a+b,0) / period;
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    upper.push(mean + stdDev * std);
    lower.push(mean - stdDev * std);
  }
  return { upper, lower };
}

async function calculateOrderQuantity(config: any): Promise<number> {
  // Obtém saldo disponível (exemplo: 100 USDT)
  const balance = await bybit.getWalletBalance({ accountType: 'UNIFIED' });
  const usdtBalance = parseFloat(balance.result?.list?.[0]?.totalWalletBalance || '0');
  const riskAmount = usdtBalance * (config.riskPercentage / 100);
  const price = await getCurrentPrice('BTCUSDT');
  const qty = riskAmount / price;
  return Math.max(0.0001, qty); // mínimo 0.0001 BTC
}

async function getCurrentPrice(symbol: string): Promise<number> {
  const ticker = await bybit.getTickers({ category: 'linear', symbol });
  return parseFloat(ticker.result?.list[0]?.lastPrice || '0');
}
