"use client";

import { useState, useCallback } from "react";

export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setPending(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(String(err));
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending, error };
}
