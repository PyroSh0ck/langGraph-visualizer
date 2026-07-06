"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Prompt } from "@prisma/client";
import { fetchPrompt } from "@/lib/apiClient";

export function usePrompt(id: string) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const fetch = useCallback(async () => {
    const token = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrompt(id);
      if (token === latest.current) setPrompt(data);
    } catch (err) {
      if (token === latest.current) setError(String(err));
    } finally {
      if (token === latest.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Intentional data-fetch on id change; the loading flag set inside `fetch`
    // is not a render cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [id, fetch]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { prompt, loading, error, refetch };
}
