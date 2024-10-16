/*
  Warnings:

  - You are about to alter the column `recipeJson` on the `UserRecipe` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("jsonb")`.
  - Added the required column `updatedAt` to the `UserRecipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRecipe" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "recipeJson" SET DATA TYPE jsonb;
