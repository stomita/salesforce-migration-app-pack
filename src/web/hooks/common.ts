import { useEffect, useRef } from "react";
import { RecoilValueReadOnly, useRecoilValueLoadable } from "recoil";

export function usePrevious<T>(v: T) {
  const ref = useRef(v);
  useEffect(() => {
    ref.current = v;
  });
  return ref.current;
}

export function useLatestRecoilValue<T, U extends T>(
  state: RecoilValueReadOnly<T>,
  defaultValue: U,
): T {
  const loadable = useRecoilValueLoadable(state);
  const value = loadable.valueMaybe();
  const prevValue = usePrevious(value);
  return value ?? prevValue ?? defaultValue;
}
