import type { NodeTypes } from "@xyflow/react";
import PromptNode from "./PromptNode";
import ToolNode from "./ToolNode";
import CustomNode from "./CustomNode";

export const nodeTypes: NodeTypes = {
  prompt: PromptNode,
  tool: ToolNode,
  custom: CustomNode,
};
