"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { AppNode, ToolConfiguration } from "../types";

export default function ToolNode({ data, selected }: NodeProps<AppNode>) {
  const config = data.configuration as ToolConfiguration;

  return (
    <div
      className={`min-w-50 rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg transition-all ${
        selected ? "ring-2 ring-sky-400" : ""
      }`}
    >
      <div className="bg-sky-500/15 px-3 py-2 text-sky-300">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Tool</span>
          <span className="truncate text-xs">{data.name}</span>
        </div>
      </div>

      <div className="space-y-2 bg-neutral-900 px-3 py-2 text-neutral-200">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Tool</span>
          <span className="text-sm">{config.toolId ?? "unset"}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Group</span>
          <span className="text-sm">{config.toolGroupId ?? "none"}</span>
        </div>

        {data.description && (
          <div className="text-xs text-neutral-500">{data.description}</div>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
