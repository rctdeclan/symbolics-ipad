import { useState, useCallback, useMemo } from "react";

export default function useObjectProxyState(initial) {
  const [state, setState] = useState(initial);

  // Immutable deep setter
  const setAtPath = useCallback((obj, path, value) => {
    if (path.length === 0) return value;

    const [head, ...rest] = path;

    return {
      ...obj,
      [head]: rest.length === 0
        ? value
        : setAtPath(obj[head] ?? {}, rest, value)
    };
  }, []);

  // Proxy creator
  const createProxy = useCallback((path = []) => {
    return new Proxy({}, {
      get(_, key) {
        // get the raw nested value
        const getValue = () =>
          path.reduce((o, k) => o?.[k], state);

        if (key === "value") {
          return getValue();
        }

        if (key === "set") {
          return (next) => {
            setState(prev => {
              const current = path.reduce((o, k) => o?.[k], prev);
              const value =
                typeof next === "function" ? next(current) : next;

              return setAtPath(prev, path, value);
            });
          };
        }

        // deeper property access -> deeper proxy
        return createProxy([...path, key]);
      }
    });
  }, [state, setAtPath]);

  // Create the root proxy only once
  const proxy = useMemo(() => createProxy([]), [createProxy]);

  return proxy;
}