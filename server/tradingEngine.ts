import { db } from './db';
import { tradingConfig, trades } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { BybitClient } from './bybit/client';
import { getIndicator } from './indicators'; // vamos criar depois

let activeInterval: NodeJS.Timeout | null = null;
let currentMode: string = 'Normal';

export async function startTradingEngine() {
  if (activeInterval) stopTradingEngine();

  // Carrega a configuração atual do banco
  const config = await db.select().from(tradingConfig).limit(1);
  if (!config.length) return;
  const { operationMode, isActive, riskPercentage, maxLeverage } = config[0];
  if (!isActive) return;

  currentMode = operationMode;
  const intervalMs = getIntervalMs(currentMode);
  
  console.log(`🚀 Iniciando motor de trading no modo ${currentMode} (a cada ${intervalMs/1000}s)`);
  
  activeInterval = setInterval(async () => {
    await tradingCycle();
  }, intervalMs);
}

export function stopTradingEngine() {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
    console.log('⏹️ Motor de trading parado');
  }
}

async function tradingCycle() {
  try {
    // 1. Verifica se o robô ainda está ativo
    const config = await db.select().from(tradingConfig).limit(1);
    if (!config.length || !config[0].isActive) {
      stopTradingEngine();
      return;
    }

    // 2. Obtém modo atual (pode ter mudado desde o último ciclo)
    const mode = config[0].operationMode;
    if (mode !== currentMode) {
      // Reinicia o motor com o novo intervalo
      currentMode = mode;
      stopTradingEngine();
      await startTradingEngine();
      return;
    }

    // 3. Busca dados de mercado (exemplo: par BTC/USDT)
    const symbol = 'BTCUSDT';
    const client = BybitClient.getInstance();
    const kline = await client.getKline(symbol, getKlineInterval(mode), 100);
    const prices = kline.map(c => c.close);
    const currentPrice = prices[prices.length - 1];

    // 4. Calcula indicadores conforme o modo
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
      const { upper, lower } = calculateBollingerBands(prices, 20, 2);
      const lastUpper = upper[upper.length - 1];
      const lastLower = lower[lower.length - 1];
      if (currentPrice <= lastLower) signal = 'buy';
      else if (currentPrice >= lastUpper) signal = 'sell';
    }

    // 5. Executa ordem se houver sinal e não houver posição aberta
    if (signal) {
      const openPositions = await client.getOpenPositions(symbol);
      if (openPositions.length === 0) {
        const orderQty = calculateOrderQuantity(config[0].riskPercentage, currentPrice);
        await client.placeOrder({
          symbol,
          side: signal === 'buy' ? 'Buy' : 'Sell',
          qty: orderQty,
          leverage: config[0].maxLeverage,
          orderType: 'Market'
        });
        // Registra o trade no banco
        await db.insert(trades).values({
          symbol,
          side: signal,
          qty: orderQty,
          price: currentPrice,
          timestamp: new Date(),
          realizedPnL: '0', // será atualizado no fechamento
          status: 'open'
        });
        console.log(`✅ Ordem executada: ${signal} ${orderQty} ${symbol} @ ${currentPrice}`);
      }
    }
  } catch (error) {
    console.error('Erro no ciclo de trading:', error);
  }
}

// --- Funções auxiliares ---
function getIntervalMs(mode: string): number {
  if (mode === 'Normal') return 60 * 60 * 1000;   // 1 hora
  if (mode === 'Estratégico') return 15 * 60 * 1000; // 15 min
  return 5 * 60 * 1000; // 5 min
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

function calculateOrderQuantity(riskPercent: number, price: number): number {
  // Lógica simplificada: riscoPercent é % do saldo a arriscar
  // Precisaríamos do saldo real. Por ora, usa valor fixo simbólico
  return 0.001; // 0.001 BTC (ajustável)
}
