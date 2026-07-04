import type {
  AppNode,
  AppEdge,
  NodeConfiguration,
  WorkflowEdgeType,
} from "./types";
import { NODE_TYPE_LABELS, EDGE_TYPE_LABELS } from "./types";

const FIELD =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-neutral-100 outline-none focus:border-neutral-400";
const LABEL = "block text-xs font-medium uppercase tracking-wide text-neutral-500";
const EDGE_TYPES: WorkflowEdgeType[] = ["normal", "conditional", "loop"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

function NodeConfigFields({
  configuration,
  onChange,
}: {
  configuration: NodeConfiguration;
  onChange: (next: NodeConfiguration) => void;
}) {
  if (configuration.kind === "prompt") {
    return (
      <Row label="Prompt Version Id">
        <input
          className={FIELD}
          value={configuration.promptVersionId ?? ""}
          placeholder="prompt_version_id"
          onChange={(event) =>
            onChange({
              ...configuration,
              promptVersionId: event.target.value || null,
            })
          }
        />
      </Row>
    );
  }

  if (configuration.kind === "tool") {
    return (
      <>
        <Row label="Tool Id">
          <input
            className={FIELD}
            value={configuration.toolId ?? ""}
            placeholder="tool_id"
            onChange={(event) =>
              onChange({ ...configuration, toolId: event.target.value || null })
            }
          />
        </Row>
        <Row label="Tool Group Id">
          <input
            className={FIELD}
            value={configuration.toolGroupId ?? ""}
            placeholder="tool_group_id"
            onChange={(event) =>
              onChange({
                ...configuration,
                toolGroupId: event.target.value || null,
              })
            }
          />
        </Row>
      </>
    );
  }

  return (
    <>
      <Row label="Custom Script Id">
        <input
          className={FIELD}
          value={configuration.customScriptId ?? ""}
          placeholder="custom_script_id"
          onChange={(event) =>
            onChange({
              ...configuration,
              customScriptId: event.target.value || null,
            })
          }
        />
      </Row>
      <Row label="Code">
        <textarea
          className={`${FIELD} h-40 font-mono text-xs`}
          value={configuration.code}
          placeholder="def route(state): ..."
          onChange={(event) =>
            onChange({ ...configuration, code: event.target.value })
          }
        />
      </Row>
      <Row label="Expected State Schema">
        <textarea
          className={`${FIELD} h-20 font-mono text-xs`}
          value={configuration.expectedStateSchema}
          onChange={(event) =>
            onChange({
              ...configuration,
              expectedStateSchema: event.target.value,
            })
          }
        />
      </Row>
    </>
  );
}

export default function ConfigPanel({
  node,
  edge,
  onNodeName,
  onNodeDescription,
  onNodeConfig,
  onEdgeType,
  onEdgeRoutingKey,
  onDelete,
}: {
  node: AppNode | null;
  edge: AppEdge | null;
  onNodeName: (id: string, value: string) => void;
  onNodeDescription: (id: string, value: string | null) => void;
  onNodeConfig: (id: string, configuration: NodeConfiguration) => void;
  onEdgeType: (id: string, type: WorkflowEdgeType) => void;
  onEdgeRoutingKey: (id: string, value: string | null) => void;
  onDelete: () => void;
}) {
  const shell =
    "absolute right-0 top-0 z-10 flex h-full w-80 flex-col gap-4 overflow-y-auto border-l border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur";

  if (node) {
    return (
      <aside className={shell}>
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-100">
            {NODE_TYPE_LABELS[node.type ?? "prompt"]} Node
          </h2>
          <button
            type="button"
            onClick={onDelete}
            className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10"
          >
            Delete
          </button>
        </header>
        <Row label="Name">
          <input
            className={FIELD}
            value={node.data.name}
            onChange={(event) => onNodeName(node.id, event.target.value)}
          />
        </Row>
        <Row label="Description">
          <textarea
            className={`${FIELD} h-16`}
            value={node.data.description ?? ""}
            onChange={(event) =>
              onNodeDescription(node.id, event.target.value || null)
            }
          />
        </Row>
        <NodeConfigFields
          configuration={node.data.configuration}
          onChange={(next) => onNodeConfig(node.id, next)}
        />
      </aside>
    );
  }

  if (edge) {
    return (
      <aside className={shell}>
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-100">Edge</h2>
          <button
            type="button"
            onClick={onDelete}
            className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10"
          >
            Delete
          </button>
        </header>
        <Row label="Type">
          <select
            className={FIELD}
            value={edge.type ?? "normal"}
            onChange={(event) =>
              onEdgeType(edge.id, event.target.value as WorkflowEdgeType)
            }
          >
            {EDGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {EDGE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Routing Key">
          <input
            className={FIELD}
            value={edge.data?.routingKey ?? ""}
            placeholder="only for conditional edges"
            disabled={edge.type !== "conditional"}
            onChange={(event) =>
              onEdgeRoutingKey(edge.id, event.target.value || null)
            }
          />
        </Row>
      </aside>
    );
  }

  return (
    <aside className={shell}>
      <p className="text-sm text-neutral-500">
        Select a node or edge to edit its configuration.
      </p>
    </aside>
  );
}
