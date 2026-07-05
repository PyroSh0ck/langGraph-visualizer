/*
  Warnings:

  - You are about to drop the column `Project_Id` on the `Prompt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Name]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_Project_Id_fkey";

-- DropIndex
DROP INDEX "Prompt_Project_Id_Name_key";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "Project_Id",
ADD COLUMN     "projectId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_Name_key" ON "Prompt"("Name");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
