import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameDefinition } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import { Button } from "../components/ui/Button";
import WordSearch from "../components/games/wordsearch/WordSearch";
import { useGeneratorStore } from "../store/generator";

const GAME_LABELS: Record<string, string> = {
  wordsearch: "Sopa de Letras",
  sudoku: "Sudoku",
  maze: "Laberinto",
  tictactoe: "Tres en Raya",
};

const slideArrow = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function PlayOnline() {
  const navigate = useNavigate();
  const { game: gameParam } = useParams<{ game: string }>();
  const gameId = gameParam as GameId;
  const definition = getGameDefinition(gameId);
  const label = GAME_LABELS[gameId] ?? "Juego";
  const storedConfig = useGeneratorStore((s) => s.configs[gameId]);
  const isWordSearch = gameId === "wordsearch";

  const config = storedConfig ?? definition?.defaultConfig;
  const [page, setPage] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const outputs = useMemo(() => {
    if (!definition || !config) return null;
    const count = (config as any).sheetCount ?? 1;
    if (isWordSearch && count > 1) {
      return Array.from({ length: count }, () => definition.generate(config));
    }
    return definition.generate(config);
  }, [definition, config, isWordSearch]);

  const dataArray = Array.isArray(outputs) ? outputs : (outputs ? [outputs] : []);
  const totalPages = dataArray.length;
  const currentData = dataArray[page] ?? null;

  const handleComplete = useCallback(() => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(page);
      return next;
    });
    if (page < totalPages - 1) {
      setTimeout(() => setPage((p) => p + 1), 1500);
    }
  }, [page, totalPages]);

  const allDone = completed.size === totalPages;

  if (!definition || !config || !currentData) {
    return (
      <div>
        <Button variant="tertiary" slideIcon={slideArrow} onClick={() => navigate("/")}>
          Volver
        </Button>
        <h1 className="mb-6 text-2xl font-bold text-primary">Juego no encontrado</h1>
        <p className="text-muted">El juego solicitado no esta disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Button variant="tertiary" slideIcon={slideArrow} className="mb-4" onClick={() => navigate(`/generator/${gameId}`)}>
        Volver
      </Button>
      <h1 className="mb-6 text-2xl font-bold text-primary">{label} — Jugar online</h1>

      {totalPages > 1 && (
        <div className="glass-card mb-4 p-3 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-30 hover:bg-white/10"
            style={{ color: "var(--text-primary)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Sopa {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-30 hover:bg-white/10"
            style={{ color: "var(--text-primary)" }}
          >
            Siguiente
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {allDone ? (
        <div className="glass-card p-8 text-center">
          <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            Completaste todas las sopas de letras!
          </p>
        </div>
      ) : (
        isWordSearch ? (
          <WordSearch
            data={currentData}
            config={{ ...config, showSolution: false } as any}
            onComplete={handleComplete}
          />
        ) : (
          <definition.Preview data={currentData as any} config={{ ...config, showSolution: false } as any} />
        )
      )}
    </div>
  );
}
