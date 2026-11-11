import { useEffect, useState } from "react";
export function useAsync(fn, deps = []) {
  const [s, set] = useState({ data: null, loading: true });
  useEffect(() => {
    let live = true;
    set((p) => ({ ...p, loading: true }));
    fn().then((data) => live && set({ data, loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return s;
}
export const daysLeft = (deadline) => Math.round((new Date(deadline + "T23:59:59") - Date.now()) / 86400000 - 0.5);
