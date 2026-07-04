# Workflow Editor

A visual, canvas-based editor for constructing LangGraph-based agent workflows on the Xclix platform. Users drag node types onto a canvas, connect them with edges, and configure each component—all without writing code. The editor serializes the complete graph (nodes, edges, configuration) into a persistence schema that mirrors the backend database and can be exported as JSON or sent to the backend.

## Concepts

### Node Types

The workflow supports three node types, each representing a different abstraction in a LangGraph workflow:

- **Prompt**: References a prompt version by ID (version control by the backend). Rendered with an emerald accent. A prompt node is a step in the workflow where a language model receives a template message.
- **Tool**: References a tool (by `toolId`) and optionally a tool group (by `toolGroupId`). Rendered with a sky accent. Tools are external functions or APIs that the agent can call during execution.
- **Custom**: Carries user-written code (Python function body) and an expected JSON schema that documents the state shape the function expects. Rendered with an amber accent. Custom nodes allow direct logic insertion; the underlying function is persisted by ID (`customScriptId`) once saved.

All nodes have a name, optional description, and typed configuration. A node's configuration is a discriminated union keyed by `kind`, ensuring type safety across prompt/tool/custom variants.

### Edge Types

Edges define control flow between nodes:

- **Normal**: A direct flow edge (solid stroke, gray). Represents sequential execution or unconditional delegation.
- **Conditional**: A branch edge that carries a `routingKey` label (dashed stroke, violet). Used when the source node returns a decision value; the routing key determines which branch is taken (e.g., "yes", "no", "error"). The label is displayed on the edge in the UI.
- **Loop**: An edge that cycles back to an earlier node (dotted stroke, amber). Used for retry logic or iterative workflows.

Edges mirror LangGraph's conditional and normal edge types, with the routing key serving as the LangGraph `condition` function's decision value.

### Relationship to LangGraph

In LangGraph terms:
- A **Prompt node** wraps a call to `model.invoke()` or similar, with the prompt template held on the backend.
- A **Tool node** wraps `model.tool_call()` or direct tool execution.
- A **Custom node** is a user-defined state processing step (e.g., a router function).
- **Normal edges** correspond to LangGraph's `edge(from_node, to_node)`.
- **Conditional edges** correspond to LangGraph's `conditional_edge(from_node, condition, edges_dict)`, where `routingKey` is the value returned by the condition.
- **Loop edges** create cycles, used for looping constructs in LangGraph.

## File Map

| File Path | Responsibility |
|-----------|---|
| `types.ts` | Type definitions for node/edge types, configurations, and record schemas; discriminated union for `NodeConfiguration`; default configuration factory. |
| `serialize.ts` | Bidirectional conversion between React Flow's in-memory graph and persistence records; `recordsToFlow` hydrates from backend data; `flowToRecords` prepares export. |
| `WorkflowEditor.tsx` | Main React component holding all graph state (nodes, edges, selection); defines React Flow event handlers; renders toolbar, canvas, and config panel. |
| `Toolbar.tsx` | Top-left toolbar with buttons to add each node type and export JSON; styled with per-type accent colors. |
| `ConfigPanel.tsx` | Right-side panel showing editable fields for selected node or edge; dispatches changes back to WorkflowEditor via callbacks. |
| `nodes/PromptNode.tsx` | React component rendering a Prompt node on canvas; shows version ID and emerald header. |
| `nodes/ToolNode.tsx` | React component rendering a Tool node on canvas; shows tool ID and group; sky header. |
| `nodes/CustomNode.tsx` | React component rendering a Custom node on canvas; displays code snippet and amber header. |
| `nodes/index.ts` | Exports `nodeTypes` map registering all three node components for React Flow. |
| `edges/index.tsx` | Edge component implementations (`NormalEdge`, `ConditionalEdge`, `LoopEdge`); `useEdgeGeometry` helper; `EdgePill` label renderer; exports `edgeTypes` map. |

## Data Model

### Core Types

```typescript
export type WorkflowNodeType = "prompt" | "tool" | "custom";
export type WorkflowEdgeType = "normal" | "conditional" | "loop";
```

### Configurations (Discriminated Union)

```typescript
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
  expectedStateSchema: string; // JSON string
};

export type NodeConfiguration =
  | PromptConfiguration
  | ToolConfiguration
  | CustomConfiguration;
```

The `kind` field ensures the discriminator is always present; TypeScript narrows the type based on `kind`.

### Node and Edge Data

```typescript
export type WorkflowNodeData = {
  name: string;
  description: string | null;
  configuration: NodeConfiguration;
};

export type WorkflowEdgeData = {
  name: string;
  description: string | null;
  routingKey: string | null; // set for conditional edges
};
```

### React Flow Types

```typescript
export type AppNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type AppEdge = Edge<WorkflowEdgeData, WorkflowEdgeType>;
```

These extend `@xyflow/react` `Node` and `Edge` with our custom data and type constraints.

### Persistence Records

```typescript
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
```

Records are the serialized form sent to or received from the backend, with metadata like `workflowId` and `projectId` for persistence scoping.

## Serialization

Two functions bridge the in-memory React Flow graph and persistence records:

### `recordsToFlow(nodeRecords, edgeRecords)`

Converts backend records into React Flow state:

- Node record `x` / `y` → React Flow `position: { x, y }`
- Node `type` → React Flow `type`
- Node `configuration` → React Flow `data.configuration`
- Edge record `sourceNodeId` / `targetNodeId` → React Flow `source` / `target`
- Edge `routingKey` → React Flow `data.routingKey` and `label` (for conditional edges)

### `flowToRecords(nodes, edges, workflowId)`

Converts the in-memory graph into persistence records:

- React Flow `position.x / .y` → Node record `x` / `y` (rounded to integers)
- React Flow `type` → Node record `type` (defaults to `"prompt"`)
- React Flow `data` → Node record `configuration`, `name`, `description`
- React Flow `source` / `target` → Edge record `sourceNodeId` / `targetNodeId`
- React Flow `data.routingKey` → Edge record `routingKey`
- Assigns the provided `workflowId` to all records

These functions are the boundary between transient client state and the backend schema. Calling `flowToRecords` is how the **Export JSON** button in the toolbar downloads the workflow; the backend would use `recordsToFlow` when loading a saved workflow.

## State & Interactions

### Held State

`WorkflowEditor` maintains:
- `nodes: AppNode[]` — the current graph nodes
- `edges: AppEdge[]` — the current graph edges
- `selectedNodeId: string | null` — ID of selected node, or null
- `selectedEdgeId: string | null` — ID of selected edge, or null (only one can be selected)

### React Flow Callbacks

- **`onNodesChange`**: Applied by React Flow when nodes are dragged, deleted (via UI), or updated. Calls `applyNodeChanges` to mutate state.
- **`onEdgesChange`**: Applied when edges are deleted or metadata changes. Calls `applyEdgeChanges`.
- **`onConnect`**: Fired when the user draws a new connection between node handles. Creates a new `AppEdge` with type `"normal"` and adds it to edges.
- **`onSelectionChange`**: Fired when the user clicks on a node or edge. Updates `selectedNodeId` or `selectedEdgeId` (or both to null if deselecting).

### Adding Nodes

The `addNode(type)` callback is triggered by toolbar buttons. It:
1. Calls `createNode(type)`, which generates a new node with:
   - Random UUID
   - Specified type
   - Default position (staggered vertically by a counter)
   - Default name (e.g., "Prompt 1")
   - Default configuration (from `defaultConfiguration(type)`)
2. Appends the node to `nodes` state

### Editing Nodes

The `ConfigPanel` allows editing selected nodes. Callbacks:
- **`onNodeName`**: Updates `node.data.name`
- **`onNodeDescription`**: Updates `node.data.description`
- **`onNodeConfig`**: Updates `node.data.configuration` (dispatches to `NodeConfigFields`, which shows type-specific fields: `promptVersionId` for Prompt, `toolId` + `toolGroupId` for Tool, `customScriptId` + `code` + `expectedStateSchema` for Custom)

All node edits are applied via `patchNode`, which clones and updates the matching node's `data` object.

### Editing Edges

The `ConfigPanel` allows editing selected edges:
- **`onEdgeType`**: Changes `edge.type`. If type becomes `"conditional"`, initializes `routingKey` to `"case"`. Updates the `label` for display.
- **`onEdgeRoutingKey`**: Updates `edge.data.routingKey` and `label`. Only enabled for conditional edges.

### Deleting

The `onDelete` callback checks which is selected:
- If `selectedNodeId`: removes the node and all edges with that node as source or target.
- Else if `selectedEdgeId`: removes the edge.
- Clears selection after deletion.

## Styling

### Theme

The editor uses a **dark theme** throughout:
- Background: `bg-neutral-950` (nearly black)
- Panels and nodes: `bg-neutral-900`
- Borders: `border-neutral-700` / `border-neutral-800`
- Text: `text-neutral-100` / `text-neutral-300` (light gray)

### Node Accents

Each node type has a distinct color:
- **Prompt** (emerald): Header `bg-emerald-500/15`, text `text-emerald-300`, selected ring `ring-emerald-400`
- **Tool** (sky): Header `bg-sky-500/15`, text `text-sky-300`, selected ring `ring-sky-400`
- **Custom** (amber): Header `bg-amber-500/15`, text `text-amber-300`, selected ring `ring-amber-400`

Toolbar buttons hover with these same accent colors for consistency.

### Edge Styling

- **Normal**: Solid gray stroke (`#525252`)
- **Conditional**: Dashed violet stroke (`#a78bfa`, `strokeDasharray: "6 4"`); routing key shown in a violet pill
- **Loop**: Dotted amber stroke (`#f59e0b`, `strokeDasharray: "2 3"`); "loop" label shown in an amber pill

All edge rendering uses `BaseEdge` and `EdgeLabelRenderer` from `@xyflow/react`.

### React Flow Stylesheet

The React Flow v12 stylesheet is imported in `WorkflowEditor.tsx` (`@xyflow/react/dist/style.css`) to provide base styling for the canvas, handles, and controls.

## Extending

### Adding a New Node Type

1. **Update types** (`types.ts`):
   - Add the new type to `WorkflowNodeType`: `export type WorkflowNodeType = "prompt" | "tool" | "custom" | "newtype"`
   - Create a new configuration type: `export type NewtypeConfiguration = { kind: "newtype"; field1: string | null; ... }`
   - Add it to the union: `export type NodeConfiguration = ... | NewtypeConfiguration`
   - Add a case to `defaultConfiguration()` returning a default instance
   - Add a label to `NODE_TYPE_LABELS`

2. **Create a node component** (e.g., `nodes/NewtypeNode.tsx`):
   - Accept `NodeProps<AppNode>` and destructure `data` and `selected`
   - Cast `data.configuration as NewtypeConfiguration`
   - Render with a unique accent color (e.g., `ring-rose-400` for selected)
   - Include `<Handle type="target" position={Position.Top} />` and `<Handle type="source" position={Position.Bottom} />`

3. **Register the component** (`nodes/index.ts`):
   - Import the new component
   - Add it to the `nodeTypes` map: `newtype: NewtypeNode`

4. **Add toolbar button** (`Toolbar.tsx`):
   - Add the new type to `NODE_TYPES` array
   - Add an entry to `ACCENTS` map with the new hover classes

5. **Add config fields** (`ConfigPanel.tsx`):
   - Extend `NodeConfigFields` with a new conditional branch checking `configuration.kind === "newtype"`
   - Render input fields for each field in `NewtypeConfiguration`
   - Call `onChange` with the updated configuration on field changes

### Adding a New Edge Type

1. **Update types** (`types.ts`):
   - Add the new type to `WorkflowEdgeType`: `export type WorkflowEdgeType = "normal" | "conditional" | "loop" | "newedge"`
   - Add a label to `EDGE_TYPE_LABELS`

2. **Create an edge component** (e.g., in `edges/index.tsx`):
   - Implement as a function accepting `EdgeProps<AppEdge>`
   - Use `getBezierPath` to compute path and label position
   - Render `<BaseEdge>` with custom `style` (stroke color, width, dasharray)
   - Optionally render an `<EdgePill>` for labels

3. **Register the component** (`edges/index.tsx`):
   - Add the new component to the `edgeTypes` map: `newedge: NewedgeEdge`

4. **Add to ConfigPanel dropdown** (`ConfigPanel.tsx`):
   - Add the new type to `EDGE_TYPES` array
   - It will automatically appear in the dropdown once registered

All changes should follow the existing patterns: discriminated unions for type safety, dedicated component files, and registration maps in index files.

## Why No Comments

The code in this directory is intentionally free of inline comments. This document is the authoritative, maintainable source of explanation. Comments in code become outdated and scattered; a centralized guide ensures consistency and accessibility. Developers should refer to this file for domain logic, design decisions, and patterns before reading implementation.
