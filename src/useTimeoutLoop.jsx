import { useEffect, useRef } from "react";

export function useTimeoutLoop(fn, delay) {
  const fnRef = useRef(fn);
  const timeoutRef = useRef(null);

  // Always keep the latest callback
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (delay == null) return;

    function tick() {
      fnRef.current();
      timeoutRef.current = setTimeout(tick, delay);
    }

    timeoutRef.current = setTimeout(tick, delay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
}
