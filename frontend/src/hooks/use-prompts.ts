"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Prompt } from "@prisma/client";
import type { PromptFilters } from "@/lib/types";
import { fetchPrompts } from "@/lib/apiClient";

export function usePrompts(filters?: PromptFilters) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const fetch = useCallback(async () => {
    const token = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrompts(filters);
      if (token === latest.current) setPrompts(data);
    } catch (err) {
      if (token === latest.current) setError(String(err));
    } finally {
      if (token === latest.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Intentional data-fetch on mount/filter-change; the loading flag set inside
    // `fetch` is not a render cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [JSON.stringify(filters), fetch]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { prompts, loading, error, refetch };
}
