import { useEffect, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useConvert } from "./hooks/useConvert";
import { Header } from "./components/Header";
import { CurlInput } from "./components/CurlInput";
import { LanguageSelector } from "./components/LanguageSelector";
import { CodeOutput } from "./components/CodeOutput";
import {
  Language,
  Variant,
  DEFAULT_LANGUAGE,
  DEFAULT_VARIANT,
  loadPersistedLanguage,
  persistLanguage,
} from "./languages";

// Dynamically import curlconverter to allow top-level WASM await to resolve
async function loadConverter() {
  return import("curlconverter");
}

type ConverterModule = Awaited<ReturnType<typeof loadConverter>>;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [curlInput, setCurlInput] = useState("");
  const [wasmReady, setWasmReady] = useState(false);
  const [converterModule, setConverterModule] = useState<ConverterModule | null>(null);

  // Load curlconverter (triggers WASM init)
  useEffect(() => {
    loadConverter().then((mod) => {
      setConverterModule(mod);
      setWasmReady(true);
    });
  }, []);

  // Language state — restored from localStorage (lazy initializer avoids re-running on every render)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    () => loadPersistedLanguage().language
  );
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    () => loadPersistedLanguage().variant
  );

  function handleLanguageSelect(language: Language, variant: Variant) {
    setSelectedLanguage(language);
    setSelectedVariant(variant);
    persistLanguage(language, variant);
  }

  // Build the conversion function for the selected variant
  const convertFn =
    converterModule && wasmReady
      ? (input: string) => {
          const fn = (converterModule as unknown as Record<string, (s: string) => string>)[
            selectedVariant.fn
          ];
          if (!fn) throw new Error(`Unknown function: ${selectedVariant.fn}`);
          return fn(input);
        }
      : null;

  const { code, error, loading } = useConvert(curlInput, convertFn, wasmReady);

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="main-content">
        <CurlInput
          value={curlInput}
          onChange={setCurlInput}
          onClear={() => setCurlInput("")}
        />
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          selectedVariant={selectedVariant}
          onSelect={handleLanguageSelect}
        />
        <CodeOutput
          code={code}
          error={error}
          loading={loading}
          hljsLang={selectedLanguage.hljs}
        />
      </main>
    </>
  );
}
