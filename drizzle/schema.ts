import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here
// Robot Configuration & Trading Tables
export const robotConfigs = mysqlTable("robot_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  operationMode: mysqlEnum("operationMode", ["Normal", "Estratégico", "Insano"]).default("Normal").notNull(),
  isActive: int("isActive").default(0).notNull(),
  riskPercentage: int("riskPercentage").default(1).notNull(),
  maxLeverage: int("maxLeverage").default(10).notNull(),
  bybitApiKey: varchar("bybitApiKey", { length: 255 }),
  bybitApiSecret: varchar("bybitApiSecret", { length: 255 }),
  accountBalance: varchar("accountBalance", { length: 50 }).default("0").notNull(),
  totalPnL: varchar("totalPnL", { length: 50 }).default("0").notNull(),
  totalTrades: int("totalTrades").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RobotConfig = typeof robotConfigs.$inferSelect;
export type InsertRobotConfig = typeof robotConfigs.$inferInsert;

// Open Positions
export const openPositions = mysqlTable("open_positions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  pair: varchar("pair", { length: 20 }).notNull(),
  direction: mysqlEnum("direction", ["Long", "Short"]).notNull(),
  positionSize: varchar("positionSize", { length: 50 }).notNull(),
  entryPrice: varchar("entryPrice", { length: 50 }).notNull(),
  currentPrice: varchar("currentPrice", { length: 50 }).notNull(),
  unrealizedPnL: varchar("unrealizedPnL", { length: 50 }).notNull(),
  stopLoss: varchar("stopLoss", { length: 50 }).notNull(),
  takeProfit: varchar("takeProfit", { length: 50 }),
  operationMode: mysqlEnum("operationMode", ["Normal", "Estratégico", "Insano"]).notNull(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
});

export type OpenPosition = typeof openPositions.$inferSelect;
export type InsertOpenPosition = typeof openPositions.$inferInsert;

// Trade History
export const tradeHistory = mysqlTable("trade_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  pair: varchar("pair", { length: 20 }).notNull(),
  direction: mysqlEnum("direction", ["Long", "Short"]).notNull(),
  entryPrice: varchar("entryPrice", { length: 50 }).notNull(),
  exitPrice: varchar("exitPrice", { length: 50 }).notNull(),
  positionSize: varchar("positionSize", { length: 50 }).notNull(),
  realizedPnL: varchar("realizedPnL", { length: 50 }).notNull(),
  score: int("score").notNull(),
  operationMode: mysqlEnum("operationMode", ["Normal", "Estratégico", "Insano"]).notNull(),
  openedAt: timestamp("openedAt").notNull(),
  closedAt: timestamp("closedAt").notNull(),
});

export type TradeHistory = typeof tradeHistory.$inferSelect;
export type InsertTradeHistory = typeof tradeHistory.$inferInsert;

// Logs and Alerts
export const logs = mysqlTable("logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  level: mysqlEnum("level", ["info", "aviso", "erro"]).notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Log = typeof logs.$inferSelect;
export type InsertLog = typeof logs.$inferInsert;

// Technical Indicators
export const technicalIndicators = mysqlTable("technical_indicators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  pair: varchar("pair", { length: 20 }).notNull(),
  smcScore: int("smcScore").notNull(),
  bosDetected: int("bosDetected").default(0).notNull(),
  chochDetected: int("chochDetected").default(0).notNull(),
  fvgActive: int("fvgActive").default(0).notNull(),
  orderBlocksActive: int("orderBlocksActive").default(0).notNull(),
  operationMode: mysqlEnum("operationMode", ["Normal", "Estratégico", "Insano"]).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = typeof technicalIndicators.$inferInsert;
