# Web UI Design Spec
**Date:** 2026-03-22
**Project:** curlconverter Web UI
**Status:** Approved

---

## Overview

A new React-based web UI for curlconverter that allows users to paste curl commands and instantly see the equivalent code in any of the 25+ supported languages. Designed for both personal/local hosting and public deployment.

---

## Tech Stack

- **Framework:** React (Vite + TypeScript)
- **Library:** `curlconverter` (imported directly as a JS/TS library)
- **Syntax highlighting:** `highlight.js` (chosen over Prism for simpler integration — auto-detects or accepts explicit language identifier)
- **Fonts:** Inter (UI), JetBrains Mono (code)
- **Theming:** CSS custom properties toggled via JS, persisted to `localStorage`

---

## WASM / Async Initialization

curlconverter's browser entry point (`src/shell/webParser.ts`) uses top-level `await` to load `tree-sitter-bash.wasm`. This means:

- The library must be imported inside an async context or after the module-level promise resolves.
- Conversion calls must be wrapped in an async function.
- The app must show a loading state until the WASM is ready.
- `loading: true` from `useConvert` covers **both** the WASM-not-yet-ready phase and the in-flight conversion phase. `CodeOutput` treats both as the same spinner state.
- `useConvert` accepts a `wasmReady: boolean` parameter and skips conversion attempts until it is `true`.

**Import strategy:** Install curlconverter as an npm package (`npm install curlconverter`). Do not use a local workspace import — the `"browser"` field in curlconverter's `package.json` remaps `Parser.ts` → `webParser.ts` only for installed packages (it points to `dist/` paths). A local source import would bypass this remapping and load the Node-only parser, breaking the build.

**`vite.config.ts` requirements:**
- `base: "/"` (default — state explicitly)
- Copy `tree-sitter-bash.wasm` from `node_modules/web-tree-sitter/` into `public/` using `vite-plugin-static-copy` or by manually placing it in `public/` as a build step
- Add `optimizeDeps: { exclude: ["web-tree-sitter"] }` to prevent Vite from pre-bundling the WASM-loading module

The app must always be served from `/` (no subpath deployment).

---

## Language Map

All supported languages, their UI labels, variant labels, and the curlconverter export function to call:

| UI Label | Variant Label | Export Function |
|---|---|---|
| Ansible | — | `toAnsible` |
| C | — | `toC` |
| C# | — | `toCSharp` |
| CFML | — | `toCFML` |
| Clojure | — | `toClojure` |
| Dart | — | `toDart` |
| Elixir | — | `toElixir` |
| Go | — | `toGo` |
| HAR | — | `toHarString` |
| HTTP | — | `toHTTP` |
| HTTPie | — | `toHttpie` |
| Java | HttpClient (default) | `toJava` |
| Java | HttpUrlConnection | `toJavaHttpUrlConnection` |
| Java | Jsoup | `toJavaJsoup` |
| Java | OkHttp | `toJavaOkHttp` |
| JavaScript | Fetch (default) | `toJavaScript` |
| JavaScript | jQuery | `toJavaScriptJquery` |
| JavaScript | XHR | `toJavaScriptXHR` |
| JSON | — | `toJsonString` |
| Julia | — | `toJulia` |
| Kotlin | — | `toKotlin` |
| Lua | — | `toLua` |
| MATLAB | — | `toMATLAB` |
| Node.js | Fetch (default) | `toNode` |
| Node.js | Axios | `toNodeAxios` |
| Node.js | Got | `toNodeGot` |
| Node.js | HTTP | `toNodeHttp` |
| Node.js | Ky | `toNodeKy` |
| Node.js | SuperAgent | `toNodeSuperAgent` |
| Node.js | Request ⚠️ deprecated | `toNodeRequest` |
| Objective-C | — | `toObjectiveC` |
| OCaml | — | `toOCaml` |
| Perl | — | `toPerl` |
| PHP | cURL (default) | `toPhp` |
| PHP | Guzzle | `toPhpGuzzle` |
| PHP | Requests | `toPhpRequests` |
| PowerShell | Invoke-RestMethod (default) | `toPowershellRestMethod` |
| PowerShell | Invoke-WebRequest | `toPowershellWebRequest` |
| Python | requests (default) | `toPython` |
| Python | http.client | `toPythonHttp` |
| R | httr (default) | `toR` |
| R | httr2 | `toRHttr2` |
| Ruby | Net::HTTP (default) | `toRuby` |
| Ruby | HTTParty | `toRubyHttparty` |
| Rust | — | `toRust` |
| Swift | — | `toSwift` |
| Wget | — | `toWget` |

**Default language on first visit:** Python (requests).

---

## Syntax Highlighting Language Identifiers

Map from UI label to `highlight.js` language identifier:

| UI Label | highlight.js identifier |
|---|---|
| Ansible | `yaml` |
| C | `c` |
| C# | `csharp` |
| CFML | `xml` (fallback, no native CFML support) |
| Clojure | `clojure` |
| Dart | `dart` |
| Elixir | `elixir` |
| Go | `go` |
| HAR | `json` |
| HTTP | `http` |
| HTTPie | `bash` |
| Java | `java` |
| JavaScript / Node.js | `javascript` |
| JSON | `json` |
| Julia | `julia` |
| Kotlin | `kotlin` |
| Lua | `lua` |
| MATLAB | `matlab` |
| Objective-C | `objectivec` |
| OCaml | `ocaml` |
| Perl | `perl` |
| PHP | `php` |
| PowerShell | `powershell` |
| Python | `python` |
| R | `r` |
| Ruby | `ruby` |
| Rust | `rust` |
| Swift | `swift` |
| Wget | `bash` |

For languages with no `highlight.js` support (CFML), fall back to plain text (no highlighting, no error).

---

## Layout

### Overall Structure (stacked, top to bottom)

1. Header
2. curl Input Panel
3. Language Selector
4. Code Output Panel

### Header
- Left: logo/app title ("curlconverter")
- Right: dark/light theme toggle button
- Single bar, minimal, no clutter

### curl Input Panel
- Full-width `<textarea>` with monospace font (JetBrains Mono)
- Subtle rounded border (8px), card-style with soft shadow
- Placeholder: `curl https://example.com -d "hello=world"`
- Top-right corner: "Clear" button — on click, clears textarea, resets output to empty state, returns focus to textarea

### Language Selector
- Single horizontally-scrollable row of pill-shaped buttons (overflow-x: auto, no wrapping)
- All languages shown; languages with variants show a small dropdown arrow
- Clicking a variant-language pill opens a small dropdown of variant options
- Active language highlighted with accent color
- On mobile: same overflow-scroll behavior is acceptable (no select fallback needed)
- Language preference (label + variant) persisted to `localStorage` key `curlconverter_lang`

### Code Output Panel
- Full-width code block with `highlight.js` syntax highlighting
- Line numbers: implemented via CSS counter on `<span>` wrappers per line (highlight.js does not support line numbers natively). Each line of output is wrapped in a `<span class="line">` element; CSS uses a counter to render line numbers in a `::before` pseudo-element.
- Top-right: "Copy" button — copies plain text to clipboard, shows "Copied!" + checkmark for 2 seconds, then resets
- **Empty input state:** Show a greyed-out placeholder message: "Paste a curl command above to see the output"
- **Error state:** Show a styled inline error message (e.g. red border, error icon, message text) — no code block shown
- **Loading state (WASM not ready):** Show a spinner/skeleton in the output panel

---

## Components

| Component | Type | Responsibility |
|---|---|---|
| `App` | Component | Root. Holds state: curl input string, selected language+variant, theme, WASM ready status. Wires everything together. |
| `Header` | Component | Renders logo and theme toggle button. Calls `toggleTheme` from `useTheme`. |
| `CurlInput` | Component | Controlled `<textarea>`. Exposes `onChange` and `onClear`. Returns focus to textarea after clear. |
| `LanguageSelector` | Component | Pill buttons. Handles variant dropdowns. Fires `onLanguageChange(label, variant, exportFn)`. |
| `CodeOutput` | Component | Renders highlighted code, empty state, error state, or loading state. Copy button. |
| `useTheme` | Hook | Reads/writes theme to `localStorage` (`curlconverter_theme`). Injects `data-theme` attribute on `<html>`. |
| `useConvert` | Hook | Takes curl string, export function, and `wasmReady: boolean`. Returns `{ code, error, loading }`. Debounced 150ms trailing-edge. Skips conversion if `wasmReady` is false. `loading` is true during both WASM init and in-flight conversion. |

`ThemeProvider` is implemented as a `useTheme` hook (not a wrapping component). `App` calls `useTheme` and passes the toggle function to `Header`.

---

## Data Flow

```
User types curl command
        ↓
CurlInput (controlled textarea) → App state (curlInput string)
        ↓ (debounced 150ms trailing-edge)
useConvert hook → calls selected export function (async, WASM-backed)
        ↓
{ code, error, loading }
        ↓
CodeOutput renders: highlighted code | error message | empty state | loading spinner
```

---

## Warnings

The `toXWarn()` variant of each generator returns `[string, Warnings]`. The UI will **silently discard warnings** in v1. Use the plain `toX()` export (not `toXWarn()`).

---

## Interactions

- **Live conversion:** Trailing-edge debounce, 150ms. Fires after user stops typing.
- **Error handling:** `try/catch` around the conversion call. On error, show error state in output panel.
- **Copy button:** Copies code to clipboard. Shows "Copied!" for 2 seconds then resets.
- **Theme toggle:** Switches light/dark. Persists to `localStorage` key `curlconverter_theme`. Default: system preference via `prefers-color-scheme`.
- **Language selection:** Persists to `localStorage`. Default on first visit: Python (requests).
- **Responsive:** Natural stacking. Language selector uses `overflow-x: auto`. Padding adjustments at `< 640px`.

---

## Visual Design

- **Light theme:** White background, light gray panels (#f5f5f5), dark text, blue accent (#2563eb)
- **Dark theme:** Dark background (#0f172a), slightly lighter panels (#1e293b), light text, blue accent (#3b82f6)
- **Borders:** 1px solid, subtle, 8px border-radius
- **Shadows:** `0 1px 4px rgba(0,0,0,0.08)` (light), `0 1px 4px rgba(0,0,0,0.4)` (dark)
- **Typography:** Inter for UI text; JetBrains Mono for curl input and code output
- **Code block background:** distinct from panel background in both themes

---

## Error Handling

- Wrap all `toX()` calls in `try/catch`
- `CCError` is exported from curlconverter — catch it specifically for known parse errors
- Display error message text inside the output panel with a red accent border
- Do not crash the page or show a blank output

---

## Out of Scope (v1)

- Backend/server — runs entirely in the browser
- Authentication
- History/saved conversions
- Sharing/permalink features
- Surfacing warnings from `toXWarn()`
- Subpath deployment (app must be served from `/`)
- Static deprecation badge for Node.js / Request variant (known v1 gap — deprecated code is shown without any indicator since warnings are silenced)
