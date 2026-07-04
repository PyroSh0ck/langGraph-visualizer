import type {
  AppNode,
  AppEdge,
  WorkflowNodeRecord,
  WorkflowEdgeRecord,
} from "./types";

export function recordsToFlow(
  nodeRecords: WorkflowNodeRecord[],
  edgeRecords: WorkflowEdgeRecord[],
): { nodes: AppNode[]; edges: AppEdge[] } {
  const nodes: AppNode[] = nodeRecords.map((record) => ({
    id: record.id,
    type: record.type,
    position: { x: record.x, y: record.y },
    data: {
      name: record.name,
      description: record.description,
      configuration: record.configuration,
    },
  }));

  const edges: AppEdge[] = edgeRecords.map((record) => ({
    id: record.id,
    type: record.type,
    source: record.sourceNodeId,
    target: record.targetNodeId,
    label: record.routingKey ?? undefined,
    data: {
      name: record.name,
      description: record.description,
      routingKey: record.routingKey,
    },
  }));

  return { nodes, edges };
}

export function flowToRecords(
  nodes: AppNode[],
  edges: AppEdge[],
  workflowId: string,
): { nodes: WorkflowNodeRecord[]; edges: WorkflowEdgeRecord[] } {
  const nodeRecords: WorkflowNodeRecord[] = nodes.map((node) => ({
    id: node.id,
    workflowId,
    type: node.type ?? "prompt",
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    configuration: node.data.configuration,
    name: node.data.name,
    description: node.data.description,
  }));

  const edgeRecords: WorkflowEdgeRecord[] = edges.map((edge) => ({
    id: edge.id,
    workflowId,
    type: edge.type ?? "normal",
    routingKey: edge.data?.routingKey ?? null,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
    name: edge.data?.name ?? "",
    description: edge.data?.description ?? null,
  }));

  return { nodes: nodeRecords, edges: edgeRecords };
}
