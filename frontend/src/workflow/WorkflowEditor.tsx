"use client";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import type {
  AppNode,
  AppEdge,
  NodeConfiguration,
  WorkflowEdgeType,
  WorkflowNodeType,
} from "./types";
import { NODE_TYPE_LABELS, defaultConfiguration } from "./types";
import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { flowToRecords } from "./serialize";
import Toolbar from "./Toolbar";
import ConfigPanel from "./ConfigPanel";

const WORKFLOW_ID = "00000000-0000-0000-0000-000000000000";

const initialNodes: AppNode[] = [
  {
    id: "seed-tool",
    type: "tool",
    position: { x: 0, y: 0 },
    data: {
      name: "Fetch Transcript",
      description: "Pulls the transcript for a video",
      configuration: { kind: "tool", toolId: "transcript_fetch", toolGroupId: null },
    },
  },
  {
    id: "seed-prompt",
    type: "prompt",
    position: { x: 0, y: 160 },
    data: {
      name: "Summarize",
      description: null,
      configuration: { kind: "prompt", promptVersionId: "summary_v1" },
    },
  },
  {
    id: "seed-custom",
    type: "custom",
    position: { x: 0, y: 340 },
    data: {
      name: "Route Output",
      description: "Chooses the next branch",
      configuration: {
        kind: "custom",
        customScriptId: null,
        code: "def route(state):\n    return state[\"next\"]",
        expectedStateSchema: "{}",
      },
    },
  },
];

const initialEdges: AppEdge[] = [
  {
    id: "seed-tool-prompt",
    type: "normal",
    source: "seed-tool",
    target: "seed-prompt",
    data: { name: "", description: null, routingKey: null },
  },
  {
    id: "seed-prompt-custom",
    type: "conditional",
    source: "seed-prompt",
    target: "seed-custom",
    label: "ok",
    data: { name: "", description: null, routingKey: "ok" },
  },
];

let nodeCounter = 0;

function createNode(type: WorkflowNodeType): AppNode {
  nodeCounter += 1;
  return {
    id: crypto.randomUUID(),
    type,
    position: { x: 240, y: 40 + nodeCounter * 30 },
    data: {
      name: `${NODE_TYPE_LABELS[type]} ${nodeCounter}`,
      description: null,
      configuration: defaultConfiguration(type),
    },
  };
}

export default function WorkflowEditor() {
  const [nodes, setNodes] = useState<AppNode[]>(initialNodes);
  const [edges, setEdges] = useState<AppEdge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) =>
      setNodes((current) => applyNodeChanges(changes, current)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<AppEdge>[]) =>
      setEdges((current) => applyEdgeChanges(changes, current)),
    [],
  );

  const onConnect = useCallback((connection: Connection) => {
    const edge: AppEdge = {
      id: crypto.randomUUID(),
      type: "normal",
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      data: { name: "", description: null, routingKey: null },
    };
    setEdges((current) => addEdge(edge, current));
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selNodes, edges: selEdges }: OnSelectionChangeParams) => {
      setSelectedNodeId(selNodes[0]?.id ?? null);
      setSelectedEdgeId(selEdges[0]?.id ?? null);
    },
    [],
  );

  const addNode = useCallback((type: WorkflowNodeType) => {
    setNodes((current) => [...current, createNode(type)]);
  }, []);

  const patchNode = useCallback(
    (id: string, patch: Partial<AppNode["data"]>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
        ),
      );
    },
    [],
  );

  const onNodeName = useCallback(
    (id: string, value: string) => patchNode(id, { name: value }),
    [patchNode],
  );

  const onNodeDescription = useCallback(
    (id: string, value: string | null) => patchNode(id, { description: value }),
    [patchNode],
  );

  const onNodeConfig = useCallback(
    (id: string, configuration: NodeConfiguration) =>
      patchNode(id, { configuration }),
    [patchNode],
  );

  const onEdgeType = useCallback((id: string, type: WorkflowEdgeType) => {
    setEdges((current) =>
      current.map((edge) => {
        if (edge.id !== id) return edge;
        const routingKey = type === "conditional" ? edge.data?.routingKey ?? "case" : null;
        return {
          ...edge,
          type,
          label: type === "conditional" ? routingKey ?? undefined : undefined,
          data: {
            name: edge.data?.name ?? "",
            description: edge.data?.description ?? null,
            routingKey,
          },
        };
      }),
    );
  }, []);

  const onEdgeRoutingKey = useCallback((id: string, value: string | null) => {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              label: value ?? undefined,
              data: {
                name: edge.data?.name ?? "",
                description: edge.data?.description ?? null,
                routingKey: value,
              },
            }
          : edge,
      ),
    );
  }, []);

  const onDelete = useCallback(() => {
    if (selectedNodeId) {
      setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
      setEdges((current) =>
        current.filter(
          (edge) =>
            edge.source !== selectedNodeId && edge.target !== selectedNodeId,
        ),
      );
      setSelectedNodeId(null);
      return;
    }
    if (selectedEdgeId) {
      setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId]);

  const onExport = useCallback(() => {
    const records = flowToRecords(nodes, edges, WORKFLOW_ID);
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "workflow.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  return (
    <div className="relative h-screen w-screen bg-neutral-950">
      <Toolbar onAddNode={addNode} onExport={onExport} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        defaultEdgeOptions={{ type: "normal" }}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
      <ConfigPanel
        node={selectedNode}
        edge={selectedEdge}
        onNodeName={onNodeName}
        onNodeDescription={onNodeDescription}
        onNodeConfig={onNodeConfig}
        onEdgeType={onEdgeType}
        onEdgeRoutingKey={onEdgeRoutingKey}
        onDelete={onDelete}
      />
    </div>
  );
}
