import { useEffect, useState } from "react";
export function useAsync(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true });
  useEffect(() => {
    let live = true;
    set((s) => ({ ...s, loading: true }));
    fn().then((data) => live && set({ data, loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line
  }, deps);
  return state;
}
export const daysLeft = (deadline) => {
  const end = new Date(deadline + "T23:59:59").getTime();
  return Math.ceil((end - Date.now()) / 86400000) - 1;
};
