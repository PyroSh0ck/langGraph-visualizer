import type { EdgeProps, EdgeTypes } from "@xyflow/react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import type { AppEdge } from "../types";

function useEdgeGeometry(props: EdgeProps<AppEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });
  return { path, labelX, labelY };
}

function EdgePill({
  x,
  y,
  text,
  className,
}: {
  x: number;
  y: number;
  text: string;
  className: string;
}) {
  return (
    <EdgeLabelRenderer>
      <div
        style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
        className={`pointer-events-none absolute rounded px-1.5 py-0.5 text-[10px] font-medium ${className}`}
      >
        {text}
      </div>
    </EdgeLabelRenderer>
  );
}

export function NormalEdge(props: EdgeProps<AppEdge>) {
  const { path } = useEdgeGeometry(props);
  return (
    <BaseEdge
      id={props.id}
      path={path}
      markerEnd={props.markerEnd}
      style={{ stroke: "#525252", strokeWidth: 1.5 }}
    />
  );
}

export function ConditionalEdge(props: EdgeProps<AppEdge>) {
  const { path, labelX, labelY } = useEdgeGeometry(props);
  const routingKey = props.data?.routingKey ?? "case";
  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={{ stroke: "#a78bfa", strokeWidth: 1.5, strokeDasharray: "6 4" }}
      />
      <EdgePill
        x={labelX}
        y={labelY}
        text={routingKey}
        className="bg-violet-500/20 text-violet-200"
      />
    </>
  );
}

export function LoopEdge(props: EdgeProps<AppEdge>) {
  const { path, labelX, labelY } = useEdgeGeometry(props);
  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={{ stroke: "#f59e0b", strokeWidth: 1.5, strokeDasharray: "2 3" }}
      />
      <EdgePill
        x={labelX}
        y={labelY}
        text="loop"
        className="bg-amber-500/20 text-amber-200"
      />
    </>
  );
}

export const edgeTypes: EdgeTypes = {
  normal: NormalEdge,
  conditional: ConditionalEdge,
  loop: LoopEdge,
};
