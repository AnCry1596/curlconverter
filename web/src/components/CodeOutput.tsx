import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "../styles/CodeOutput.css";

// Import highlight.js theme — chosen to work well in both light and dark
import "highlight.js/styles/github-dark-dimmed.css";

interface CodeOutputProps {
  code: string | null;
  error: string | null;
  loading: boolean;
  hljsLang: string;
}

function highlightCode(code: string, lang: string): string {
  try {
    const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
    return result.value;
  } catch {
    // Language not supported — return escaped plain text
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

function wrapLines(html: string): string {
  // Split on actual newlines (not HTML tags)
  const lines = html.split("\n");
  // Remove trailing empty line if present
  const trimmed = lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
  return trimmed.map((line) => `<span class="line">${line}</span>`).join("\n");
}

export function CodeOutput({ code, error, loading, hljsLang }: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed (permission denied, non-secure context, etc.)
    }
  }

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const highlighted = code ? wrapLines(highlightCode(code, hljsLang)) : null;

  return (
    <div className="code-output-panel">
      <div className="code-output-header">
        <span className="code-output-label">output</span>
        {code && (
          <button
            className={`copy-btn${copied ? " copied" : ""}`}
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        )}
      </div>

      {loading && (
        <div className="code-output-loading">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      )}

      {!loading && error && (
        <div className="code-output-error">⚠ {error}</div>
      )}

      {!loading && !error && !code && (
        <div className="code-output-empty">
          Paste a curl command above to see the output
        </div>
      )}

      {!loading && !error && highlighted && (
        <div className="code-block">
          <pre>
            <code
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      )}
    </div>
  );
}
