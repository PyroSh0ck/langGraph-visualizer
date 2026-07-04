import type { WorkflowNodeType } from "./types";
import { NODE_TYPE_LABELS } from "./types";

const NODE_TYPES: WorkflowNodeType[] = ["prompt", "tool", "custom"];

const ACCENTS: Record<WorkflowNodeType, string> = {
  prompt: "hover:border-emerald-400 hover:text-emerald-300",
  tool: "hover:border-sky-400 hover:text-sky-300",
  custom: "hover:border-amber-400 hover:text-amber-300",
};

export default function Toolbar({
  onAddNode,
  onExport,
}: {
  onAddNode: (type: WorkflowNodeType) => void;
  onExport: () => void;
}) {
  return (
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/90 p-2 backdrop-blur">
      <span className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Add
      </span>
      {NODE_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onAddNode(type)}
          className={`rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300 transition ${ACCENTS[type]}`}
        >
          {NODE_TYPE_LABELS[type]}
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-neutral-800" />
      <button
        type="button"
        onClick={onExport}
        className="rounded bg-neutral-200 px-3 py-1 text-sm font-medium text-neutral-900 transition hover:bg-white"
      >
        Export JSON
      </button>
    </div>
  );
}
