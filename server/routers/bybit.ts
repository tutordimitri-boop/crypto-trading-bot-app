import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { bybit, formatBybitError } from '../bybit/client';
import { TRPCError } from '@trpc/server';

export const bybitRouter = router({
  /**
   * Obter saldo da conta
   */
  getBalance: protectedProcedure
    .query(async () => {
      try {
        const wallet = await bybit.getWalletBalance({
          accountType: 'UNIFIED',
        });

        if (!wallet.result) {
          throw new Error('Resposta inválida da Bybit');
        }

        const balanceData = wallet.result?.list?.[0] || {};
        return {
          totalBalance: balanceData.totalWalletBalance || '0',
          totalMarginBalance: balanceData.totalMarginBalance || '0',
          coins: wallet.result?.list || [],
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao obter saldo: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Obter posições abertas
   */
  getOpenPositions: protectedProcedure
    .input(
      z.object({
        category: z.enum(['linear', 'inverse', 'spot']).default('linear'),
      })
    )
    .query(async ({ input }) => {
      try {
        const positions = await bybit.getPositionInfo({
          category: input.category,
        });

        if (!positions.result || !positions.result.list) {
          return [];
        }

        return positions.result.list.map((pos: any) => ({
          symbol: pos.symbol,
          side: pos.side === 'Buy' ? 'Long' : 'Short',
          size: parseFloat(pos.size),
          entryPrice: parseFloat(pos.avgPrice),
          markPrice: parseFloat(pos.markPrice),
          unrealizedPnL: parseFloat(pos.unrealizedPnl),
          unrealizedPnLPercent: parseFloat(pos.unrealizedPnlPcnt),
          leverage: pos.leverage,
          stopLoss: pos.stopLoss ? parseFloat(pos.stopLoss) : null,
          takeProfit: pos.takeProfit ? parseFloat(pos.takeProfit) : null,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao obter posições: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Executar trade
   */
  executeTrade: protectedProcedure
    .input(
      z.object({
        symbol: z.string(), // "BTCUSDT"
        side: z.enum(['Buy', 'Sell']),
        orderType: z.enum(['Market', 'Limit']).default('Market'),
        qty: z.number().positive(),
        price: z.number().positive().optional(),
        stopLoss: z.number().optional(),
        takeProfit: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const orderParams: any = {
          category: 'linear',
          symbol: input.symbol,
          side: input.side,
          orderType: input.orderType,
          qty: input.qty.toString(),
          timeInForce: 'GTC',
        };

        if (input.orderType === 'Limit' && input.price) {
          orderParams.price = input.price.toString();
        }

        if (input.stopLoss) {
          orderParams.stopLoss = input.stopLoss.toString();
        }

        if (input.takeProfit) {
          orderParams.takeProfit = input.takeProfit.toString();
        }

        const order = await bybit.submitOrder(orderParams);

        if (!order.result) {
          throw new Error('Resposta inválida ao executar trade');
        }

        return {
          success: true,
          orderId: order.result.orderId,
          symbol: input.symbol,
          side: input.side === 'Buy' ? 'Long' : 'Short',
          qty: input.qty,
          price: input.price || null,
          message: `Trade ${input.side} executado com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao executar trade: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Fechar posição
   */
  closePosition: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        side: z.enum(['Buy', 'Sell']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const closeSide = input.side === 'Buy' ? 'Sell' : 'Buy';

        const order = await bybit.submitOrder({
          category: 'linear',
          symbol: input.symbol,
          side: closeSide,
          orderType: 'Market',
          qty: '0', // Fecha posição inteira
          reduceOnly: true,
        });

        if (!order.result) {
          throw new Error('Resposta inválida ao fechar posição');
        }

        return {
          success: true,
          orderId: order.result.orderId,
          message: `Posição ${input.symbol} fechada com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao fechar posição: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Atualizar stop loss
   */
  updateStopLoss: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        stopLoss: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await bybit.setTradingStop({
          category: 'linear',
          symbol: input.symbol,
          stopLoss: input.stopLoss.toString(),
          positionIdx: 0,
        });

        if (!result.result) {
          throw new Error('Resposta inválida ao atualizar stop loss');
        }

        return {
          success: true,
          message: 'Stop loss atualizado com sucesso',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao atualizar stop loss: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Obter histórico de trades
   */
  getTradeHistory: protectedProcedure
    .input(
      z.object({
        category: z.enum(['linear', 'inverse', 'spot']).default('linear'),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const trades = await bybit.getExecutionList({
          category: input.category,
          limit: input.limit,
        });

        if (!trades.result || !trades.result.list) {
          return [];
        }

        return trades.result.list.map((trade: any) => ({
          symbol: trade.symbol,
          side: trade.side === 'Buy' ? 'Long' : 'Short',
          price: parseFloat(trade.execPrice),
          qty: parseFloat(trade.execQty),
          fee: parseFloat(trade.execFee),
          time: trade.execTime,
          type: trade.execType,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao obter histórico: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Obter informações de mercado
   */
  getMarketInfo: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const tickers = await bybit.getTickers({
          category: 'linear',
          symbol: input.symbol,
        });

        if (!tickers.result || !tickers.result.list || tickers.result.list.length === 0) {
          throw new Error('Informações de mercado não encontradas');
        }

        const ticker = tickers.result.list[0];

        return {
          symbol: ticker.symbol,
          lastPrice: parseFloat(ticker.lastPrice),
          highPrice24h: parseFloat(ticker.highPrice24h),
          lowPrice24h: parseFloat(ticker.lowPrice24h),
          volume24h: parseFloat(ticker.volume24h),
          turnover24h: parseFloat(ticker.turnover24h),
          change24h: parseFloat(ticker.price24hPcnt),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao obter informações de mercado: ${formatBybitError(error)}`,
        });
      }
    }),

  /**
   * Verificar conexão com Bybit
   */
  verifyConnection: protectedProcedure.query(async () => {
    try {
      const wallet = await bybit.getWalletBalance({
        accountType: 'UNIFIED',
      });

      const balance = wallet.result?.list?.[0]?.totalWalletBalance || '0';
      return {
        success: true,
        message: 'Conexão com Bybit estabelecida',
        balance,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na conexão: ${formatBybitError(error)}`,
      };
    }
  }),
});
