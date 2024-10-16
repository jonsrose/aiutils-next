/*
  Warnings:

  - You are about to alter the column `recipeJson` on the `UserRecipe` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("jsonb")`.

*/
-- AlterTable
ALTER TABLE "UserRecipe" ALTER COLUMN "recipeJson" SET DATA TYPE jsonb;
