export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function isNotNullOrUndefined<T>(o: T | null | undefined): o is T {
  return o != null;
}

function zeropad(n: number, d: number) {
  let dd = 1;
  while (d > 0) {
    d--;
    dd *= 10;
    if (n < dd) {
      break;
    }
  }
  return (
    Array.from({ length: d })
      .map(() => "0")
      .join("") + String(n)
  );
}

export function formatNumber(n: number | null | undefined) {
  if (n == null) {
    return "-";
  }
  let s = "";
  do {
    if (s) {
      s = "," + s;
    }
    const nn = Math.floor(n / 1000);
    const rn = n % 1000;
    s = (nn === 0 ? String(rn) : zeropad(rn, 3)) + s;
    n = nn;
  } while (n > 0);
  return s;
}
