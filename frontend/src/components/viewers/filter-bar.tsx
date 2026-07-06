"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FilterState {
  q?: string;
  createdAfter?: string;
  createdBefore?: string;
}

interface FilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const handleChange = (key: keyof FilterState, newValue: string) => {
    onChange({
      ...value,
      [key]: newValue === "" ? undefined : newValue,
    });
  };

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Filter by name…"
          value={value.q ?? ""}
          onChange={(e) => handleChange("q", e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="created-after">After:</Label>
        <Input
          id="created-after"
          type="date"
          value={value.createdAfter ?? ""}
          onChange={(e) => handleChange("createdAfter", e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="created-before">Before:</Label>
        <Input
          id="created-before"
          type="date"
          value={value.createdBefore ?? ""}
          onChange={(e) => handleChange("createdBefore", e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
