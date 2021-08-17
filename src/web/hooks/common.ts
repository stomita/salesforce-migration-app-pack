import { useEffect, useRef } from "react";

export function usePrevious<T>(v: T) {
  const ref = useRef(v);
  useEffect(() => {
    ref.current = v;
  });
  return ref.current;
}
