import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-lg font-bold text-gray-900">
            Generador de Juegos Imprimibles
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        Generador de Juegos Imprimibles
      </footer>
    </div>
  );
}
