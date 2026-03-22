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
      return;
    }

    // If input is empty, show empty state
    if (!curlInput.trim()) {
      setResult({ code: null, error: null, loading: false });
      return;
    }

    // Debounce: 150ms trailing-edge
    if (timerRef.current) clearTimeout(timerRef.current);

    setResult((prev) => ({ ...prev, loading: true }));

    timerRef.current = setTimeout(async () => {
      try {
        const code = await Promise.resolve(convertFn(curlInput));
        setResult({ code, error: null, loading: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to convert curl command.";
        setResult({ code: null, error: message, loading: false });
      }
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [curlInput, convertFn, wasmReady]);

  return result;
}
