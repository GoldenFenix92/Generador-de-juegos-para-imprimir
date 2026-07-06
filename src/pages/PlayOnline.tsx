import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getGameDefinition } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import { useGeneratorStore } from "../store/generator";

const GAME_LABELS: Record<string, string> = {
  wordsearch: "Sopa de Letras",
  sudoku: "Sudoku",
  maze: "Laberinto",
  tictactoe: "Tres en Raya",
};

export default function PlayOnline() {
  const { game: gameParam } = useParams<{ game: string }>();
  const gameId = gameParam as GameId;
  const definition = getGameDefinition(gameId);
  const label = GAME_LABELS[gameId] ?? "Juego";
  const storedConfig = useGeneratorStore((s) => s.configs[gameId]);

  const config = storedConfig ?? definition?.defaultConfig;
  const data = useMemo(() => {
    if (!definition || !config) return null;
    return definition.generate(config);
  }, [definition, config]);

  if (!definition || !config || !data) {
    return (
      <div>
        <Link to="/" className="mb-4 inline-block text-sm hover:underline text-accent">
          &larr; Volver
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-primary">Juego no encontrado</h1>
        <p className="text-muted">El juego solicitado no esta disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/generator/${gameId}`} className="mb-4 inline-block text-sm hover:underline text-accent">
        &larr; Volver
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-primary">{label} — Jugar online</h1>

      <definition.Preview data={data as any} config={{ ...config, showSolution: false } as any} />
    </div>
  );
}
