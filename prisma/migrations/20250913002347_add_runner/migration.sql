-- CreateTable
CREATE TABLE "public"."Runner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "area" TEXT,
    "paceSec" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avatarUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Runner_userId_key" ON "public"."Runner"("userId");

-- CreateIndex
CREATE INDEX "Runner_isPublic_area_idx" ON "public"."Runner"("isPublic", "area");

-- AddForeignKey
ALTER TABLE "public"."Runner" ADD CONSTRAINT "Runner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
