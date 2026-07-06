import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="glass-btn !rounded-full !p-2 !border-0 !shadow-none !bg-transparent hover:!bg-white/10"
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {dark ? (
        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function AmbientBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="blob w-96 h-96 -top-20 -left-20" style={{ background: "var(--blob-1)" }} />
      <div className="blob blob-delayed w-[30rem] h-[30rem] top-1/3 -right-32" style={{ background: "var(--blob-2)" }} />
      <div className="blob blob-slow w-80 h-80 bottom-0 left-1/4" style={{ background: "var(--blob-3)" }} />
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AmbientBlobs />
      <header className="glass sticky top-0 z-50 border-b border-[var(--glass-border)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/" className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Generador de Juegos Imprimibles
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      <footer className="glass border-t border-[var(--glass-border)] px-6 py-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Generador de Juegos Imprimibles
      </footer>
    </div>
  );
}
