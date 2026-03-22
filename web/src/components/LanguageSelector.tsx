import { useEffect, useRef, useState } from "react";
import { LANGUAGES, Language, Variant } from "../languages";
import "../styles/LanguageSelector.css";

interface LanguageSelectorProps {
  selectedLanguage: Language;
  selectedVariant: Variant;
  onSelect: (language: Language, variant: Variant) => void;
}

export function LanguageSelector({
  selectedLanguage,
  selectedVariant,
  onSelect,
}: LanguageSelectorProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handlePillClick(language: Language) {
    const hasVariants = language.variants && language.variants.length > 1;
    if (hasVariants) {
      setOpenLabel(openLabel === language.label ? null : language.label);
    } else {
      // Single-variant language: select immediately
      onSelect(language, language.variants![0]);
      setOpenLabel(null);
    }
  }

  function handleVariantClick(language: Language, variant: Variant) {
    onSelect(language, variant);
    setOpenLabel(null);
  }

  return (
    <div className="lang-selector" ref={containerRef}>
      <div className="lang-selector-inner">
        {LANGUAGES.map((lang) => {
          const isActive = lang.label === selectedLanguage.label;
          const hasVariants = lang.variants && lang.variants.length > 1;
          const isOpen = openLabel === lang.label;

          return (
            <div key={lang.label} className="lang-item">
              <button
                className={`lang-pill${isActive ? " active" : ""}`}
                onClick={() => handlePillClick(lang)}
                aria-expanded={hasVariants ? isOpen : undefined}
              >
                {lang.label}
                {hasVariants && <span className="arrow">▾</span>}
              </button>

              {hasVariants && isOpen && (
                <div className="lang-dropdown" role="menu">
                  {lang.variants!.map((v) => (
                    <button
                      key={v.label}
                      className={
                        isActive && v.label === selectedVariant.label
                          ? "active-variant"
                          : ""
                      }
                      onClick={() => handleVariantClick(lang, v)}
                      role="menuitem"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
