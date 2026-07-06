"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Run } from "@prisma/client";
import type { RunFilters } from "@/lib/types";
import { fetchRuns } from "@/lib/apiClient";

export function useRuns(filters?: RunFilters) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const fetch = useCallback(async () => {
    const token = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRuns(filters);
      if (token === latest.current) setRuns(data);
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

  return { runs, loading, error, refetch };
}
