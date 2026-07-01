import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, robotConfigs, openPositions, tradeHistory, logs, technicalIndicators } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Robot Config queries
export async function getRobotConfig(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(robotConfigs).where(eq(robotConfigs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateRobotConfig(userId: number, data: Partial<typeof robotConfigs.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  
  // Buscar configuração atual
  const existing = await db.select().from(robotConfigs).where(eq(robotConfigs.userId, userId)).limit(1);
  
  // Mesclar dados atuais com novos dados
  const mergedData = {
    userId,
    operationMode: data.operationMode ?? existing[0]?.operationMode ?? 'Normal',
    isActive: data.isActive ?? existing[0]?.isActive ?? 0,
    riskPercentage: data.riskPercentage ?? existing[0]?.riskPercentage ?? 1,
    maxLeverage: data.maxLeverage ?? existing[0]?.maxLeverage ?? 10,
    accountBalance: data.accountBalance ?? existing[0]?.accountBalance ?? '0',
    totalPnL: data.totalPnL ?? existing[0]?.totalPnL ?? '0',
    totalTrades: data.totalTrades ?? existing[0]?.totalTrades ?? 0,
    bybitApiKey: data.bybitApiKey ?? existing[0]?.bybitApiKey ?? null,
    bybitApiSecret: data.bybitApiSecret ?? existing[0]?.bybitApiSecret ?? null,
  };
  
  // UPSERT: insere se não existir, atualiza se existir
  const result = await db.insert(robotConfigs)
    .values(mergedData)
    .onDuplicateKeyUpdate({ set: mergedData });
  return result;
}

// Open Positions queries
export async function getOpenPositions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(openPositions).where(eq(openPositions.userId, userId));
}

export async function createOpenPosition(data: typeof openPositions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(openPositions).values(data);
  return result;
}

// Trade History queries
export async function getTradeHistory(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(tradeHistory)
    .where(eq(tradeHistory.userId, userId))
    .orderBy(desc(tradeHistory.closedAt))
    .limit(limit)
    .offset(offset);
}

// Logs queries
export async function getLogs(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(logs)
    .where(eq(logs.userId, userId))
    .orderBy(desc(logs.timestamp))
    .limit(limit);
}

export async function createLog(data: typeof logs.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(logs).values(data);
}

// Technical Indicators queries
export async function getTechnicalIndicators(userId: number, pair: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(technicalIndicators)
    .where(eq(technicalIndicators.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateTechnicalIndicators(userId: number, data: Partial<typeof technicalIndicators.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.update(technicalIndicators).set(data).where(eq(technicalIndicators.userId, userId));
}
