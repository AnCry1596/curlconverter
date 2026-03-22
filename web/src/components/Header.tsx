import "../styles/Header.css";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="header-logo">
          curl<span>converter</span>
        </span>
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
      </div>
    </header>
  );
}
