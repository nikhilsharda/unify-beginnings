import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Vercel's function filesystem is read-only outside /tmp. Copy the seeded
// SQLite file into /tmp (writable, per-instance) on cold start so the demo
// stays interactive; writes reset when the instance recycles.
if (process.env.VERCEL) {
  const tmpDb = "/tmp/dev.db";
  if (!fs.existsSync(tmpDb)) {
    fs.copyFileSync(path.join(process.cwd(), "prisma/dev.db"), tmpDb);
  }
  process.env.DATABASE_URL = `file:${tmpDb}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
