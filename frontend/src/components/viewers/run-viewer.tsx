"use client";

import { useState } from "react";
import type { Run } from "@prisma/client";
import type { RunFilters } from "@/lib/types";
import { useRuns } from "@/hooks/use-runs";
import { formatDate, formatCost, formatTokens } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "./filter-bar";

type RunRow = Run & { prompt?: { id: string; Name: string } | null };

interface RunViewerProps {
  compact?: boolean;
}

export function RunViewer({ compact = false }: RunViewerProps) {
  const [filters, setFilters] = useState<RunFilters>({});
  const { runs, loading, error } = useRuns(filters);

  if (loading) {
    return <div>Loading…</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (runs.length === 0) {
    return <div>No runs.</div>;
  }

  const runRows = runs as RunRow[];

  return (
    <div>
      <FilterBar value={filters} onChange={setFilters} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Executed</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            {!compact && <TableHead>Speed</TableHead>}
            {!compact && <TableHead>Tokens</TableHead>}
            {!compact && <TableHead>Cost</TableHead>}
            {!compact && <TableHead>Quality</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {runRows.map((run) => (
            <TableRow key={run.id}>
              <TableCell>{formatDate(run.Executed_At)}</TableCell>
              <TableCell>{run.prompt?.Name ?? "—"}</TableCell>
              <TableCell>
                {run.Model_Company} / {run.Model_Name}
              </TableCell>
              <TableCell>{run.Status}</TableCell>
              {!compact && <TableCell>{run.Speed ?? "—"}</TableCell>}
              {!compact && (
                <TableCell>
                  {formatTokens(run.Input_Tokens, run.Output_Tokens)}
                </TableCell>
              )}
              {!compact && (
                <TableCell>{formatCost(run.Estimated_Cost)}</TableCell>
              )}
              {!compact && (
                <TableCell>{JSON.stringify(run.Output_Quality)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
