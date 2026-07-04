-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('OpenAI', 'Anthropic', 'Google', 'Custom');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('Success', 'Failed', 'Timeout');

-- CreateEnum
CREATE TYPE "WorkflowNodeType" AS ENUM ('Prompt', 'Tool', 'Custom');

-- CreateEnum
CREATE TYPE "WorkflowEdgeType" AS ENUM ('loop', 'conditional', 'normal');

-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('Pending', 'Running', 'Completed', 'Completed_With_Errors', 'Failed');

-- CreateEnum
CREATE TYPE "EvaluationRunStatus" AS ENUM ('Pending', 'Running', 'Completed', 'Completed_With_Errors', 'Failed');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('Owner', 'Admin', 'Regular', 'Viewer');

-- CreateEnum
CREATE TYPE "ExecutionType" AS ENUM ('Mock', 'HTTP', 'Langchain_Native');

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "External_Auth_Id" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" UUID NOT NULL,
    "Project_Id" UUID NOT NULL,
    "User_Id" UUID NOT NULL,
    "Role" "ProjectRole" NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Project_Id" UUID NOT NULL,
    "Best_Version_Id" UUID,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" UUID NOT NULL,
    "Prompt_Id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Default_Temperature" DOUBLE PRECISION NOT NULL,
    "Default_Top_P" DOUBLE PRECISION NOT NULL,
    "Default_Max_Tokens" INTEGER NOT NULL,
    "Version_Messages" JSONB NOT NULL,
    "Bound_Tools" UUID[],
    "Response_Schema" JSONB NOT NULL,
    "Context_Schema" JSONB NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" UUID NOT NULL,
    "Workflow_Run_Id" UUID,
    "Prompt_Id" UUID,
    "Version_Id" UUID,
    "Project_Id" UUID NOT NULL,
    "Executed_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Model_Company" "ProviderType" NOT NULL,
    "Model_Name" TEXT NOT NULL,
    "Model_Output" JSONB NOT NULL,
    "Input_Variables" JSONB NOT NULL,
    "Output_Quality" JSONB NOT NULL,
    "Speed" INTEGER NOT NULL,
    "Input_Tokens" INTEGER NOT NULL,
    "Output_Tokens" INTEGER NOT NULL,
    "Estimated_Cost" DOUBLE PRECISION NOT NULL,
    "Formatting_Accuracy" DOUBLE PRECISION NOT NULL,
    "Temperature" DOUBLE PRECISION NOT NULL,
    "Top_P" DOUBLE PRECISION NOT NULL,
    "Max_Tokens" INTEGER NOT NULL,
    "Status" "RunStatus" NOT NULL,
    "Status_Message" TEXT NOT NULL,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" UUID NOT NULL,
    "Group" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Project_Id" UUID NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNode" (
    "id" UUID NOT NULL,
    "Workflow_Id" UUID NOT NULL,
    "Type" "WorkflowNodeType" NOT NULL,
    "X_Coordinate" INTEGER NOT NULL,
    "Y_Coordinate" INTEGER NOT NULL,
    "Configuration" JSONB NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowEdge" (
    "id" UUID NOT NULL,
    "Workflow_Id" UUID NOT NULL,
    "Type" "WorkflowEdgeType" NOT NULL,
    "Routing_Key" TEXT,
    "Source_Node_Id" UUID NOT NULL,
    "Target_Node_Id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" UUID NOT NULL,
    "Workflow_Id" UUID NOT NULL,
    "Status" "WorkflowRunStatus" NOT NULL,
    "Input_Variables" JSONB NOT NULL,
    "Final_Output" JSONB NOT NULL,
    "Execution_Time_ms" INTEGER NOT NULL,
    "Total_Cost" DOUBLE PRECISION NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomScript" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Expected_State_Schema" JSONB NOT NULL,
    "Project_Id" UUID NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Project_Id" UUID NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Dataset_Id" UUID NOT NULL,
    "Description" TEXT,
    "Input_Variables" JSONB NOT NULL,
    "Expected_Output" TEXT NOT NULL,
    "Assertion_Rules" JSONB NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationRun" (
    "id" UUID NOT NULL,
    "Dataset_Id" UUID NOT NULL,
    "Version_Id" UUID,
    "Workflow_Id" UUID,
    "Project_Id" UUID NOT NULL,
    "Overall_Score" DOUBLE PRECISION NOT NULL,
    "Total_Cost" DOUBLE PRECISION NOT NULL,
    "Pass_Rate" DOUBLE PRECISION NOT NULL,
    "Status" "EvaluationRunStatus" NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" UUID NOT NULL,
    "Evaluation_Run_Id" UUID NOT NULL,
    "Test_Case_Id" UUID NOT NULL,
    "Executed_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Passed" BOOLEAN NOT NULL,
    "Output" JSONB,
    "Latency_ms" INTEGER NOT NULL,
    "Input_Tokens" INTEGER NOT NULL,
    "Output_Tokens" INTEGER NOT NULL,
    "Error_Logs" TEXT,
    "Cost" DOUBLE PRECISION NOT NULL,
    "Score" DOUBLE PRECISION,
    "Assertion_Snapshot" JSONB NOT NULL,
    "Expected_Output_Snapshot" TEXT NOT NULL,

    CONSTRAINT "EvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolGroup" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Project_Id" UUID NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Project_Id" UUID,
    "Tool_Group_Id" UUID,
    "Description" TEXT NOT NULL,
    "Execution_Type" "ExecutionType" NOT NULL,
    "Execution_Config" JSONB NOT NULL,
    "Payload_Schema" JSONB NOT NULL,
    "Response_Mapping" JSONB,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCredentials" (
    "id" UUID NOT NULL,
    "Project_Id" UUID NOT NULL,
    "Added_By_Id" UUID,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Provider_Name" "ProviderType" NOT NULL,
    "Base_URL" TEXT,
    "Encrypted_API_Key" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_External_Auth_Id_key" ON "User"("External_Auth_Id");

-- CreateIndex
CREATE INDEX "ProjectMember_User_Id_idx" ON "ProjectMember"("User_Id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_Project_Id_User_Id_key" ON "ProjectMember"("Project_Id", "User_Id");

-- CreateIndex
CREATE INDEX "Prompt_Best_Version_Id_idx" ON "Prompt"("Best_Version_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_Project_Id_Name_key" ON "Prompt"("Project_Id", "Name");

-- CreateIndex
CREATE UNIQUE INDEX "Version_Prompt_Id_Name_key" ON "Version"("Prompt_Id", "Name");

-- CreateIndex
CREATE INDEX "Run_Project_Id_idx" ON "Run"("Project_Id");

-- CreateIndex
CREATE INDEX "Run_Prompt_Id_idx" ON "Run"("Prompt_Id");

-- CreateIndex
CREATE INDEX "Run_Version_Id_idx" ON "Run"("Version_Id");

-- CreateIndex
CREATE INDEX "Run_Workflow_Run_Id_idx" ON "Run"("Workflow_Run_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_Project_Id_Name_key" ON "Workflow"("Project_Id", "Name");

-- CreateIndex
CREATE INDEX "WorkflowNode_Workflow_Id_idx" ON "WorkflowNode"("Workflow_Id");

-- CreateIndex
CREATE INDEX "WorkflowEdge_Workflow_Id_idx" ON "WorkflowEdge"("Workflow_Id");

-- CreateIndex
CREATE INDEX "WorkflowEdge_Source_Node_Id_idx" ON "WorkflowEdge"("Source_Node_Id");

-- CreateIndex
CREATE INDEX "WorkflowEdge_Target_Node_Id_idx" ON "WorkflowEdge"("Target_Node_Id");

-- CreateIndex
CREATE INDEX "WorkflowRun_Workflow_Id_idx" ON "WorkflowRun"("Workflow_Id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomScript_Project_Id_Name_key" ON "CustomScript"("Project_Id", "Name");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_Project_Id_Name_key" ON "Dataset"("Project_Id", "Name");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_Dataset_Id_Name_key" ON "TestCase"("Dataset_Id", "Name");

-- CreateIndex
CREATE INDEX "EvaluationRun_Dataset_Id_idx" ON "EvaluationRun"("Dataset_Id");

-- CreateIndex
CREATE INDEX "EvaluationRun_Project_Id_idx" ON "EvaluationRun"("Project_Id");

-- CreateIndex
CREATE INDEX "EvaluationRun_Version_Id_idx" ON "EvaluationRun"("Version_Id");

-- CreateIndex
CREATE INDEX "EvaluationRun_Workflow_Id_idx" ON "EvaluationRun"("Workflow_Id");

-- CreateIndex
CREATE INDEX "EvaluationResult_Evaluation_Run_Id_idx" ON "EvaluationResult"("Evaluation_Run_Id");

-- CreateIndex
CREATE INDEX "EvaluationResult_Test_Case_Id_idx" ON "EvaluationResult"("Test_Case_Id");

-- CreateIndex
CREATE UNIQUE INDEX "ToolGroup_Project_Id_Name_key" ON "ToolGroup"("Project_Id", "Name");

-- CreateIndex
CREATE INDEX "Tool_Project_Id_idx" ON "Tool"("Project_Id");

-- CreateIndex
CREATE INDEX "Tool_Tool_Group_Id_idx" ON "Tool"("Tool_Group_Id");

-- CreateIndex
CREATE INDEX "ProviderCredentials_Added_By_Id_idx" ON "ProviderCredentials"("Added_By_Id");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCredentials_Project_Id_Name_key" ON "ProviderCredentials"("Project_Id", "Name");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_User_Id_fkey" FOREIGN KEY ("User_Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_Best_Version_Id_fkey" FOREIGN KEY ("Best_Version_Id") REFERENCES "Version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_Prompt_Id_fkey" FOREIGN KEY ("Prompt_Id") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_Prompt_Id_fkey" FOREIGN KEY ("Prompt_Id") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_Version_Id_fkey" FOREIGN KEY ("Version_Id") REFERENCES "Version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_Workflow_Run_Id_fkey" FOREIGN KEY ("Workflow_Run_Id") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_Workflow_Id_fkey" FOREIGN KEY ("Workflow_Id") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_Workflow_Id_fkey" FOREIGN KEY ("Workflow_Id") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_Source_Node_Id_fkey" FOREIGN KEY ("Source_Node_Id") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_Target_Node_Id_fkey" FOREIGN KEY ("Target_Node_Id") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_Workflow_Id_fkey" FOREIGN KEY ("Workflow_Id") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomScript" ADD CONSTRAINT "CustomScript_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_Dataset_Id_fkey" FOREIGN KEY ("Dataset_Id") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_Dataset_Id_fkey" FOREIGN KEY ("Dataset_Id") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_Version_Id_fkey" FOREIGN KEY ("Version_Id") REFERENCES "Version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_Workflow_Id_fkey" FOREIGN KEY ("Workflow_Id") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_Evaluation_Run_Id_fkey" FOREIGN KEY ("Evaluation_Run_Id") REFERENCES "EvaluationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_Test_Case_Id_fkey" FOREIGN KEY ("Test_Case_Id") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolGroup" ADD CONSTRAINT "ToolGroup_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_Tool_Group_Id_fkey" FOREIGN KEY ("Tool_Group_Id") REFERENCES "ToolGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCredentials" ADD CONSTRAINT "ProviderCredentials_Project_Id_fkey" FOREIGN KEY ("Project_Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCredentials" ADD CONSTRAINT "ProviderCredentials_Added_By_Id_fkey" FOREIGN KEY ("Added_By_Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
