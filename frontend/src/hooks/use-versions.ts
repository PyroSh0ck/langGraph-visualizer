"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Version } from "@prisma/client";
import { fetchVersions } from "@/lib/apiClient";

export function useVersions(promptId: string) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const fetch = useCallback(async () => {
    const token = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVersions(promptId);
      if (token === latest.current) setVersions(data);
    } catch (err) {
      if (token === latest.current) setError(String(err));
    } finally {
      if (token === latest.current) setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    // Intentional data-fetch on promptId change; the loading flag set inside
    // `fetch` is not a render cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [promptId, fetch]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { versions, loading, error, refetch };
}
