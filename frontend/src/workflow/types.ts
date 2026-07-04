import type { Node, Edge } from "@xyflow/react";

export type WorkflowNodeType = "prompt" | "tool" | "custom";
export type WorkflowEdgeType = "normal" | "conditional" | "loop";

export type PromptConfiguration = {
  kind: "prompt";
  promptVersionId: string | null;
};

export type ToolConfiguration = {
  kind: "tool";
  toolId: string | null;
  toolGroupId: string | null;
};

export type CustomConfiguration = {
  kind: "custom";
  customScriptId: string | null;
  code: string;
  expectedStateSchema: string;
};

export type NodeConfiguration =
  | PromptConfiguration
  | ToolConfiguration
  | CustomConfiguration;

export type WorkflowNodeData = {
  name: string;
  description: string | null;
  configuration: NodeConfiguration;
};

export type WorkflowEdgeData = {
  name: string;
  description: string | null;
  routingKey: string | null;
};

export type AppNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type AppEdge = Edge<WorkflowEdgeData, WorkflowEdgeType>;

export type WorkflowNodeRecord = {
  id: string;
  workflowId: string;
  type: WorkflowNodeType;
  x: number;
  y: number;
  configuration: NodeConfiguration;
  name: string;
  description: string | null;
};

export type WorkflowEdgeRecord = {
  id: string;
  workflowId: string;
  type: WorkflowEdgeType;
  routingKey: string | null;
  sourceNodeId: string;
  targetNodeId: string;
  name: string;
  description: string | null;
};

export type WorkflowRecord = {
  id: string;
  projectId: string;
  group: string;
  name: string;
};

export const NODE_TYPE_LABELS: Record<WorkflowNodeType, string> = {
  prompt: "Prompt",
  tool: "Tool",
  custom: "Custom",
};

export const EDGE_TYPE_LABELS: Record<WorkflowEdgeType, string> = {
  normal: "Normal",
  conditional: "Conditional",
  loop: "Loop",
};

export function defaultConfiguration(
  type: WorkflowNodeType,
): NodeConfiguration {
  switch (type) {
    case "prompt":
      return { kind: "prompt", promptVersionId: null };
    case "tool":
      return { kind: "tool", toolId: null, toolGroupId: null };
    case "custom":
      return {
        kind: "custom",
        customScriptId: null,
        code: "",
        expectedStateSchema: "{}",
      };
  }
}
