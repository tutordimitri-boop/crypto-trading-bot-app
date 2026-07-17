import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  defaultStrategies,
  generateTradingSignal,
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateMACD,
  type Strategy,
  type PriceAlert,
} from '../strategies';
import { TRPCError } from '@trpc/server';

// Simular armazenamento de estratégias e alertas (em produção, usar banco de dados)
const userStrategies = new Map<number, Strategy[]>();
const priceAlerts = new Map<number, PriceAlert[]>();

export const strategiesRouter = router({
  /**
   * Obter todas as estratégias disponíveis
   */
  getAvailableStrategies: protectedProcedure.query(async () => {
    return defaultStrategies;
  }),

  /**
   * Obter estratégias do usuário
   */
  getUserStrategies: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    return userStrategies.get(userId) || defaultStrategies;
  }),

  /**
   * Ativar/desativar estratégia
   */
  toggleStrategy: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const strategies = userStrategies.get(userId) || [...defaultStrategies];

      const strategy = strategies.find((s) => s.id === input.strategyId);
      if (!strategy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Estratégia não encontrada',
        });
      }

      strategy.enabled = input.enabled;
      userStrategies.set(userId, strategies);

      return strategy;
    }),

  /**
   * Atualizar parâmetros da estratégia
   */
  updateStrategyParameters: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        parameters: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const strategies = userStrategies.get(userId) || [...defaultStrategies];

      const strategy = strategies.find((s) => s.id === input.strategyId);
      if (!strategy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Estratégia não encontrada',
        });
      }

      strategy.parameters = { ...strategy.parameters, ...input.parameters };
      userStrategies.set(userId, strategies);

      return strategy;
    }),

  /**
   * Gerar sinal de trading para uma estratégia
   */
  generateSignal: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        prices: z.array(z.number()).min(1),
      })
    )
    .query(async ({ input }) => {
      const strategy = defaultStrategies.find((s) => s.id === input.strategyId);
      if (!strategy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Estratégia não encontrada',
        });
      }

      const indicators = generateTradingSignal(input.prices, strategy as Strategy);
      const mainSignal = indicators[0]?.signal || 'neutral';

      return {
        strategy: strategy.name,
        mainSignal,
        indicators,
        confidence: indicators.filter((ind) => ind.signal === mainSignal).length / indicators.length,
      };
    }),

  /**
   * Calcular indicadores técnicos
   */
  calculateIndicators: protectedProcedure
    .input(
      z.object({
        prices: z.array(z.number()).min(1),
        indicators: z.array(z.enum(['RSI', 'SMA', 'EMA', 'MACD', 'BB'])).optional(),
      })
    )
    .query(async ({ input }) => {
      const results: Record<string, any> = {};
      const prices = input.prices;
      const indicatorsToCalculate = input.indicators || ['RSI', 'SMA', 'EMA', 'MACD', 'BB'];

      if (indicatorsToCalculate.includes('RSI')) {
        results.rsi = calculateRSI(prices, 14);
      }

      if (indicatorsToCalculate.includes('SMA')) {
        results.sma20 = calculateSMA(prices, 20);
        results.sma50 = calculateSMA(prices, 50);
      }

      if (indicatorsToCalculate.includes('EMA')) {
        results.ema12 = calculateEMA(prices, 12);
        results.ema26 = calculateEMA(prices, 26);
      }

      if (indicatorsToCalculate.includes('MACD')) {
        results.macd = calculateMACD(prices, 12, 26, 9);
      }

      if (indicatorsToCalculate.includes('BB')) {
        results.bollingerBands = calculateBollingerBands(prices, 20, 2);
      }

      return results;
    }),

  /**
   * Criar alerta de preço
   */
  createPriceAlert: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        condition: z.enum(['above', 'below']),
        price: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const alerts = priceAlerts.get(userId) || [];

      const alert: PriceAlert = {
        id: `alert-${Date.now()}`,
        symbol: input.symbol,
        condition: input.condition,
        price: input.price,
        enabled: true,
        triggered: false,
        createdAt: Date.now(),
      };

      alerts.push(alert);
      priceAlerts.set(userId, alerts);

      return alert;
    }),

  /**
   * Obter alertas de preço do usuário
   */
  getPriceAlerts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    return priceAlerts.get(userId) || [];
  }),

  /**
   * Deletar alerta de preço
   */
  deletePriceAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const alerts = priceAlerts.get(userId) || [];

      const index = alerts.findIndex((a) => a.id === input.alertId);
      if (index === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Alerta não encontrado',
        });
      }

      alerts.splice(index, 1);
      priceAlerts.set(userId, alerts);

      return { success: true };
    }),

  /**
   * Verificar alertas de preço
   */
  checkPriceAlerts: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        currentPrice: z.number().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const alerts = priceAlerts.get(userId) || [];

      const triggeredAlerts = alerts.filter((alert) => {
        if (!alert.enabled || alert.symbol !== input.symbol) return false;

        if (alert.condition === 'above' && input.currentPrice >= alert.price) {
          return true;
        }
        if (alert.condition === 'below' && input.currentPrice <= alert.price) {
          return true;
        }

        return false;
      });

      return triggeredAlerts;
    }),
});
