import { useEffect, useRef, useState } from "react";

type ConvertFn = (input: string) => Promise<string> | string;

interface ConvertResult {
  code: string | null;
  error: string | null;
  loading: boolean;
}

export function useConvert(
  curlInput: string,
  convertFn: ConvertFn | null,
  wasmReady: boolean
): ConvertResult {
  const [result, setResult] = useState<ConvertResult>({
    code: null,
    error: null,
    loading: true,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If WASM not ready, stay in loading state
    if (!wasmReady || !convertFn) {
      setResult({ code: null, error: null, loading: true });
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    // If input is empty, show empty state
    if (!curlInput.trim()) {
      setResult({ code: null, error: null, loading: false });
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    // Debounce: 150ms trailing-edge
    if (timerRef.current) clearTimeout(timerRef.current);

    setResult((prev) => ({ ...prev, loading: true }));

    let cancelled = false;
    timerRef.current = setTimeout(async () => {
      try {
        const code = await Promise.resolve(convertFn(curlInput));
        if (!cancelled) setResult({ code, error: null, loading: false });
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to convert curl command.";
          setResult({ code: null, error: message, loading: false });
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [curlInput, convertFn, wasmReady]);

  return result;
}
