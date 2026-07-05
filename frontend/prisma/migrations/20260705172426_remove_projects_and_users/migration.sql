-- DropForeignKey
ALTER TABLE "CustomScript" DROP CONSTRAINT "CustomScript_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "Dataset" DROP CONSTRAINT "Dataset_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "EvaluationRun" DROP CONSTRAINT "EvaluationRun_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_User_Id_fkey";

-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProviderCredentials" DROP CONSTRAINT "ProviderCredentials_Added_By_Id_fkey";

-- DropForeignKey
ALTER TABLE "ProviderCredentials" DROP CONSTRAINT "ProviderCredentials_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "Run" DROP CONSTRAINT "Run_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "Tool" DROP CONSTRAINT "Tool_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "ToolGroup" DROP CONSTRAINT "ToolGroup_Project_Id_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_Project_Id_fkey";

-- DropIndex
DROP INDEX "CustomScript_Project_Id_Name_key";

-- DropIndex
DROP INDEX "Dataset_Project_Id_Name_key";

-- DropIndex
DROP INDEX "EvaluationRun_Project_Id_idx";

-- DropIndex
DROP INDEX "ProviderCredentials_Added_By_Id_idx";

-- DropIndex
DROP INDEX "ProviderCredentials_Project_Id_Name_key";

-- DropIndex
DROP INDEX "Run_Project_Id_idx";

-- DropIndex
DROP INDEX "Tool_Project_Id_idx";

-- DropIndex
DROP INDEX "ToolGroup_Project_Id_Name_key";

-- DropIndex
DROP INDEX "Workflow_Project_Id_Name_key";

-- AlterTable
ALTER TABLE "CustomScript" DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "Dataset" DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "EvaluationRun" DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "ProviderCredentials" DROP COLUMN "Added_By_Id",
DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "Run" DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "ToolGroup" DROP COLUMN "Project_Id";

-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "Project_Id";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectMember";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "ProjectRole";

-- CreateIndex
CREATE UNIQUE INDEX "CustomScript_Name_key" ON "CustomScript"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_Name_key" ON "Dataset"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCredentials_Name_key" ON "ProviderCredentials"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "ToolGroup_Name_key" ON "ToolGroup"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_Name_key" ON "Workflow"("Name");
