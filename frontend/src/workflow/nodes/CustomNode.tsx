"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { AppNode, CustomConfiguration } from "../types";

export default function CustomNode({ data, selected }: NodeProps<AppNode>) {
  const config = data.configuration as CustomConfiguration;

  return (
    <div
      className={`min-w-50 rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg transition-all ${
        selected ? "ring-2 ring-amber-400" : ""
      }`}
    >
      <div className="bg-amber-500/15 px-3 py-2 text-amber-300">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Custom</span>
          <span className="truncate text-xs">{data.name}</span>
        </div>
      </div>

      <div className="space-y-2 bg-neutral-900 px-3 py-2 text-neutral-200">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Script</span>
          <span className="text-sm">{config.customScriptId ?? "unsaved"}</span>
        </div>

        {config.code ? (
          <pre className="mt-1 max-h-24 overflow-hidden rounded bg-black/60 p-2 text-[10px] font-mono text-neutral-400 whitespace-pre-wrap">
            {config.code}
          </pre>
        ) : (
          <div className="mt-1 rounded bg-black/60 p-2 text-[10px] font-mono text-neutral-600">
            no code
          </div>
        )}

        {data.description && (
          <div className="text-xs text-neutral-500">{data.description}</div>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
