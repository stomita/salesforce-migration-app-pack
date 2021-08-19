export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function isNotNullOrUndefined<T>(o: T | null | undefined): o is T {
  return o != null;
}
