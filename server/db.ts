import { desc, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertRecordedCampusPoint, InsertUser, recordedCampusPoints, users } from "../drizzle/schema";
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

export async function listRecordedCampusPoints(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recordedCampusPoints).where(eq(recordedCampusPoints.userId, userId)).orderBy(desc(recordedCampusPoints.createdAt));
}

export async function createRecordedCampusPoint(point: InsertRecordedCampusPoint) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(recordedCampusPoints).values(point);
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(recordedCampusPoints).where(eq(recordedCampusPoints.id, insertedId)).limit(1);
  return created[0];
}

export async function deleteRecordedCampusPoint(userId: number, pointId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const point = await db.select().from(recordedCampusPoints).where(and(eq(recordedCampusPoints.id, pointId), eq(recordedCampusPoints.userId, userId))).limit(1);
  if (!point[0]) return false;
  await db.delete(recordedCampusPoints).where(eq(recordedCampusPoints.id, pointId));
  return true;
}
