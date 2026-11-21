import { useCallback, useEffect, useState } from "react";

export function useHomeAnimeList(
  fetchList: () => Promise<{ data: unknown[] }>,
  errorMessage: string,
) {
  const [items, setItems] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchList();
      setItems(data || []);
    } catch {
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchList, errorMessage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, isLoading, error, reload };
}
