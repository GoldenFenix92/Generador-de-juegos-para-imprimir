import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

const navItems = [
  {
    to: "/",
    label: "Inicio",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    gradientFrom: "#D97706",
    gradientTo: "#F59E0B",
  },
  {
    to: "/generator/wordsearch",
    label: "Sopa",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    gradientFrom: "#0D9488",
    gradientTo: "#14B8A6",
  },
  {
    to: "/generator/sudoku",
    label: "Sudoku",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm2 2h12M12 4v16" />
      </svg>
    ),
    gradientFrom: "#3B82F6",
    gradientTo: "#60A5FA",
  },
  {
    to: "/generator/maze",
    label: "Laberinto",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradientFrom: "#8B5CF6",
    gradientTo: "#A78BFA",
  },
  {
    to: "/generator/tictactoe",
    label: "Tres Raya",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    gradientFrom: "#EC4899",
    gradientTo: "#F472B6",
  },
  {
    to: "/generator/crossword",
    label: "Crucigrama",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v16M10 4v16M14 4v16M18 4v16" />
      </svg>
    ),
    gradientFrom: "#F59E0B",
    gradientTo: "#FBBF24",
  },
];

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
      className="relative w-[56px] h-[28px] rounded-full transition-all duration-300 shrink-0"
      style={{
        background: dark
          ? "linear-gradient(135deg, #1e293b, #334155)"
          : "linear-gradient(135deg, var(--accent), #06B6D4)",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
      }}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          background: dark ? "#0F172A" : "#fff",
          transform: dark ? "translateX(28px)" : "translateX(0)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        {dark ? (
          <svg className="h-3 w-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </span>
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

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(24px)",
        borderColor: "var(--card-border)",
      }}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-2">
        <Link to="/" className="text-base font-bold shrink-0" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          Generador de Juegos
        </Link>

        <ul className="hidden sm:flex items-center gap-2 lg:gap-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const gFrom = item.gradientFrom;
            const gTo = item.gradientTo;

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="relative w-[42px] h-[42px] lg:w-[46px] lg:h-[46px] rounded-full flex items-center justify-center transition-all duration-500 hover:w-[100px] lg:hover:w-[120px] group cursor-pointer no-underline"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${gFrom}, ${gTo})`
                      : "var(--card-bg)",
                    backdropFilter: "blur(12px)",
                    border: isActive ? "none" : "1px solid var(--card-border)",
                    boxShadow: isActive ? `0 0 20px ${gFrom}40` : "none",
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${gFrom}, ${gTo})`,
                    }}
                  />

                  <span
                    className="absolute top-[6px] inset-x-3 h-full rounded-full blur-[12px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-40"
                    style={{
                      background: `linear-gradient(135deg, ${gFrom}, ${gTo})`,
                    }}
                  />

                  <span
                    className="relative z-10 transition-all duration-500 group-hover:scale-0"
                    style={{ color: isActive ? "#fff" : "var(--accent)" }}
                  >
                    {item.icon}
                  </span>

                  <span
                    className="absolute text-white uppercase tracking-wide text-[10px] lg:text-[11px] font-semibold transition-all duration-500 scale-0 group-hover:scale-100 delay-100 whitespace-nowrap"
                    style={{ zIndex: 10 }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="sm:hidden p-2 rounded-lg transition-all hover:bg-white/10"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ color: "var(--text-primary)" }}
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {menuOpen && (
        <div
          className="sm:hidden border-t px-4 py-3 pb-4 space-y-2"
          style={{
            background: "var(--card-bg)",
            backdropFilter: "blur(24px)",
            borderColor: "var(--card-border)",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${item.gradientFrom}20, ${item.gradientTo}20)`
                    : "transparent",
                  color: isActive ? item.gradientFrom : "var(--text-primary)",
                  border: isActive ? `0.5px solid ${item.gradientFrom}40` : "0.5px solid transparent",
                }}
              >
                <span style={{ color: isActive ? item.gradientFrom : "var(--accent)" }}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AmbientBlobs />
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      <footer
        className="border-t px-4 sm:px-6 py-4 text-center text-sm"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(24px)",
          borderColor: "var(--card-border)",
          color: "var(--text-muted)",
        }}
      >
        Generador de Juegos Imprimibles
      </footer>
    </div>
  );
}
