-- Manual migration: add_monitor_model
-- DO NOT run `prisma migrate` while Supabase project wljgmmxpawumcunqirfl is PAUSED.
-- After unpause: npx prisma migrate deploy
-- (or apply this file in the Supabase SQL editor)

CREATE TABLE IF NOT EXISTS "Monitor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'http',
    "interval" INTEGER NOT NULL DEFAULT 60,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "retries" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastCheck" TIMESTAMP(3),
    "lastStatusCode" INTEGER,
    "lastLatency" INTEGER,
    "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Monitor" DROP CONSTRAINT IF EXISTS "Monitor_userId_fkey";
ALTER TABLE "Monitor"
  ADD CONSTRAINT "Monitor_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Monitor_userId_idx" ON "Monitor"("userId");
CREATE INDEX IF NOT EXISTS "Monitor_userId_status_idx" ON "Monitor"("userId", "status");

-- Additive columns if an older Monitor table already exists
ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "retries" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "lastCheck" TIMESTAMP(3);
ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "lastStatusCode" INTEGER;
ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "lastLatency" INTEGER;
ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100;
