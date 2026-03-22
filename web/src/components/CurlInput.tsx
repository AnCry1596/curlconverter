import { useRef } from "react";
import "../styles/CurlInput.css";

interface CurlInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function CurlInput({ value, onChange, onClear }: CurlInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleClear() {
    onClear();
    textareaRef.current?.focus();
  }

  return (
    <div className="curl-input-panel">
      <div className="curl-input-header">
        <span className="curl-input-label">curl command</span>
        <button className="curl-clear-btn" onClick={handleClear} aria-label="Clear input">
          Clear
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="curl-textarea mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`curl https://example.com -d "hello=world"`}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
