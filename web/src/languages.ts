export interface Language {
  label: string;
  hljs: string; // highlight.js language identifier
  variants?: Variant[];
}

export interface Variant {
  label: string;
  fn: string; // curlconverter export function name
}

export interface ResolvedLanguage {
  language: Language;
  variant: Variant;
}

// All languages in display order
export const LANGUAGES: Language[] = [
  { label: "Ansible", hljs: "yaml", variants: [{ label: "default", fn: "toAnsible" }] },
  { label: "C", hljs: "c", variants: [{ label: "default", fn: "toC" }] },
  { label: "C#", hljs: "csharp", variants: [{ label: "default", fn: "toCSharp" }] },
  { label: "CFML", hljs: "xml", variants: [{ label: "default", fn: "toCFML" }] },
  { label: "Clojure", hljs: "clojure", variants: [{ label: "default", fn: "toClojure" }] },
  { label: "Dart", hljs: "dart", variants: [{ label: "default", fn: "toDart" }] },
  { label: "Elixir", hljs: "elixir", variants: [{ label: "default", fn: "toElixir" }] },
  { label: "Go", hljs: "go", variants: [{ label: "default", fn: "toGo" }] },
  { label: "HAR", hljs: "json", variants: [{ label: "default", fn: "toHarString" }] },
  { label: "HTTP", hljs: "http", variants: [{ label: "default", fn: "toHTTP" }] },
  { label: "HTTPie", hljs: "bash", variants: [{ label: "default", fn: "toHttpie" }] },
  {
    label: "Java",
    hljs: "java",
    variants: [
      { label: "HttpClient", fn: "toJava" },
      { label: "HttpUrlConnection", fn: "toJavaHttpUrlConnection" },
      { label: "Jsoup", fn: "toJavaJsoup" },
      { label: "OkHttp", fn: "toJavaOkHttp" },
    ],
  },
  {
    label: "JavaScript",
    hljs: "javascript",
    variants: [
      { label: "Fetch", fn: "toJavaScript" },
      { label: "jQuery", fn: "toJavaScriptJquery" },
      { label: "XHR", fn: "toJavaScriptXHR" },
    ],
  },
  { label: "JSON", hljs: "json", variants: [{ label: "default", fn: "toJsonString" }] },
  { label: "Julia", hljs: "julia", variants: [{ label: "default", fn: "toJulia" }] },
  { label: "Kotlin", hljs: "kotlin", variants: [{ label: "default", fn: "toKotlin" }] },
  { label: "Lua", hljs: "lua", variants: [{ label: "default", fn: "toLua" }] },
  { label: "MATLAB", hljs: "matlab", variants: [{ label: "default", fn: "toMATLAB" }] },
  {
    label: "Node.js",
    hljs: "javascript",
    variants: [
      { label: "Fetch", fn: "toNode" },
      { label: "Axios", fn: "toNodeAxios" },
      { label: "Got", fn: "toNodeGot" },
      { label: "HTTP", fn: "toNodeHttp" },
      { label: "Ky", fn: "toNodeKy" },
      { label: "SuperAgent", fn: "toNodeSuperAgent" },
      { label: "Request (deprecated)", fn: "toNodeRequest" },
    ],
  },
  { label: "Objective-C", hljs: "objectivec", variants: [{ label: "default", fn: "toObjectiveC" }] },
  { label: "OCaml", hljs: "ocaml", variants: [{ label: "default", fn: "toOCaml" }] },
  { label: "Perl", hljs: "perl", variants: [{ label: "default", fn: "toPerl" }] },
  {
    label: "PHP",
    hljs: "php",
    variants: [
      { label: "cURL", fn: "toPhp" },
      { label: "Guzzle", fn: "toPhpGuzzle" },
      { label: "Requests", fn: "toPhpRequests" },
    ],
  },
  {
    label: "PowerShell",
    hljs: "powershell",
    variants: [
      { label: "Invoke-RestMethod", fn: "toPowershellRestMethod" },
      { label: "Invoke-WebRequest", fn: "toPowershellWebRequest" },
    ],
  },
  {
    label: "Python",
    hljs: "python",
    variants: [
      { label: "requests", fn: "toPython" },
      { label: "http.client", fn: "toPythonHttp" },
    ],
  },
  {
    label: "R",
    hljs: "r",
    variants: [
      { label: "httr", fn: "toR" },
      { label: "httr2", fn: "toRHttr2" },
    ],
  },
  {
    label: "Ruby",
    hljs: "ruby",
    variants: [
      { label: "Net::HTTP", fn: "toRuby" },
      { label: "HTTParty", fn: "toRubyHttparty" },
    ],
  },
  { label: "Rust", hljs: "rust", variants: [{ label: "default", fn: "toRust" }] },
  { label: "Swift", hljs: "swift", variants: [{ label: "default", fn: "toSwift" }] },
  { label: "Wget", hljs: "bash", variants: [{ label: "default", fn: "toWget" }] },
];

// Default: Python / requests
export const DEFAULT_LANGUAGE = LANGUAGES.find((l) => l.label === "Python")!;
export const DEFAULT_VARIANT = DEFAULT_LANGUAGE.variants![0];

// Load persisted language from localStorage, fall back to default
export function loadPersistedLanguage(): ResolvedLanguage {
  try {
    const raw = localStorage.getItem("curlconverter_lang");
    if (!raw) return { language: DEFAULT_LANGUAGE, variant: DEFAULT_VARIANT };
    const { label, variantLabel } = JSON.parse(raw);
    const language = LANGUAGES.find((l) => l.label === label);
    if (!language) return { language: DEFAULT_LANGUAGE, variant: DEFAULT_VARIANT };
    const variant = language.variants?.find((v) => v.label === variantLabel);
    if (!variant) return { language: DEFAULT_LANGUAGE, variant: DEFAULT_VARIANT };
    return { language, variant };
  } catch {
    return { language: DEFAULT_LANGUAGE, variant: DEFAULT_VARIANT };
  }
}

export function persistLanguage(language: Language, variant: Variant): void {
  try {
    localStorage.setItem(
      "curlconverter_lang",
      JSON.stringify({ label: language.label, variantLabel: variant.label })
    );
  } catch {
    // localStorage unavailable
  }
}
