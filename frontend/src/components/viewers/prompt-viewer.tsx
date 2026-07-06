"use client";

import { useState } from "react";
import Link from "next/link";
import type { Prompt } from "@prisma/client";
import type { PromptFilters } from "@/lib/types";
import { usePrompts } from "@/hooks/use-prompts";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "./filter-bar";

interface PromptViewerProps {
  compact?: boolean;
}

export function PromptViewer({ compact = false }: PromptViewerProps) {
  const [filters, setFilters] = useState<PromptFilters>({});
  const { prompts, loading, error } = usePrompts(filters);

  if (loading) {
    return <div>Loading…</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (prompts.length === 0) {
    return <div>No prompts.</div>;
  }

  return (
    <div>
      <FilterBar value={filters} onChange={setFilters} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            {!compact && <TableHead>Best Version</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow key={prompt.id}>
              <TableCell>
                <Link href={`/prompts/${prompt.id}`}>{prompt.Name}</Link>
              </TableCell>
              <TableCell>{prompt.Description}</TableCell>
              <TableCell>{formatDate(prompt.Created_At)}</TableCell>
              {!compact && (
                <TableCell>{prompt.Best_Version_Id ?? "—"}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
