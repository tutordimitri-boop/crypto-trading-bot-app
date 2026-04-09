import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getRobotConfig, updateRobotConfig, getOpenPositions, getTradeHistory, getLogs, createLog, getTechnicalIndicators } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Robot Management
  robot: router({
    getConfig: protectedProcedure.query(async ({ ctx }) => {
      const config = await getRobotConfig(ctx.user.id);
      return config || {
        operationMode: "Normal",
        isActive: false,
        riskPercentage: 1,
        maxLeverage: 10,
        accountBalance: "0",
        totalPnL: "0",
        totalTrades: 0,
      };
    }),

    updateMode: protectedProcedure
      .input(z.enum(["Normal", "Estratégico", "Insano"]))
      .mutation(async ({ ctx, input }) => {
        await updateRobotConfig(ctx.user.id, { operationMode: input });
        return { success: true, mode: input };
      }),

    toggleActive: protectedProcedure
      .input(z.boolean())
      .mutation(async ({ ctx, input }) => {
        await updateRobotConfig(ctx.user.id, { isActive: input ? 1 : 0 });
        return { success: true, isActive: input };
      }),

    updateRiskSettings: protectedProcedure
      .input(z.object({
        riskPercentage: z.number().min(0.1).max(10),
        maxLeverage: z.number().min(1).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateRobotConfig(ctx.user.id, {
          riskPercentage: input.riskPercentage,
          maxLeverage: input.maxLeverage,
        });
        return { success: true };
      }),

    updateApiKeys: protectedProcedure
      .input(z.object({
        apiKey: z.string(),
        apiSecret: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateRobotConfig(ctx.user.id, {
          bybitApiKey: input.apiKey,
          bybitApiSecret: input.apiSecret,
        });
        return { success: true };
      }),
  }),

  // Positions Management
  positions: router({
    getOpen: protectedProcedure.query(async ({ ctx }) => {
      return await getOpenPositions(ctx.user.id);
    }),
  }),

  // Trade History
  trades: router({
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        return await getTradeHistory(ctx.user.id, input.limit, input.offset);
      }),
  }),

  // Logs & Alerts
  logs: router({
    getLogs: protectedProcedure
      .input(z.object({
        limit: z.number().default(100),
      }))
      .query(async ({ ctx, input }) => {
        return await getLogs(ctx.user.id, input.limit);
      }),

    addLog: protectedProcedure
      .input(z.object({
        level: z.enum(["info", "aviso", "erro"]),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createLog({
          userId: ctx.user.id,
          level: input.level,
          message: input.message,
        });
        return { success: true };
      }),
  }),

  // Technical Indicators
  indicators: router({
    get: protectedProcedure
      .input(z.object({
        pair: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await getTechnicalIndicators(ctx.user.id, input.pair);
      }),
  }),
});

export type AppRouter = typeof appRouter;
