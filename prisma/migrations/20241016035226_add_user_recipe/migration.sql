-- CreateTable
CREATE TABLE "UserRecipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recipeJson" JSONB NOT NULL,

    CONSTRAINT "UserRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRecipe_userId_idx" ON "UserRecipe"("userId");

-- AddForeignKey
ALTER TABLE "UserRecipe" ADD CONSTRAINT "UserRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
