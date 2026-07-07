import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameDefinition } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import { Button } from "../components/ui/Button";
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

  const config = storedConfig ?? definition?.defaultConfig;
  const data = useMemo(() => {
    if (!definition || !config) return null;
    return definition.generate(config);
  }, [definition, config]);

  if (!definition || !config || !data) {
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

      <definition.Preview data={data as any} config={{ ...config, showSolution: false } as any} />
    </div>
  );
}
