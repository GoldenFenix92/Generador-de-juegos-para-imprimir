import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getGameDefinition } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { DifficultySelector } from "../components/ui/DifficultySelector";
import { useGeneratorStore } from "../store/generator";
import type { GameConfig } from "../types/games";
import type { WordSearchMode } from "../components/games/wordsearch/types";

const GAME_LABELS: Record<string, string> = {
  wordsearch: "Sopa de Letras",
  sudoku: "Sudoku",
  maze: "Laberinto",
  tictactoe: "Tres en Raya",
};

const WORD_COUNT_OPTIONS = [5, 10, 15, 20];

function WordSearchOptions({
  wordCount,
  mode,
  onChange,
}: {
  wordCount: number;
  mode: WordSearchMode;
  onChange: (patch: Partial<GameConfig & { wordCount: number; mode: WordSearchMode }>) => void;
}) {
  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad de palabras</label>
        <Select
          value={String(wordCount)}
          onChange={(e) => onChange({ wordCount: Number(e.target.value) as 5 | 10 | 15 | 20 })}
        >
          {WORD_COUNT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} palabras
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Modo</label>
        <Select
          value={mode}
          onChange={(e) => onChange({ mode: e.target.value as WordSearchMode })}
        >
          <option value="print">Para imprimir</option>
          <option value="online">Jugar online</option>
        </Select>
      </div>
    </>
  );
}

export default function Generator() {
  const { game: gameParam } = useParams<{ game: string }>();
  const navigate = useNavigate();
  const gameId = gameParam as GameId;
  const definition = getGameDefinition(gameId);
  const label = GAME_LABELS[gameId] ?? "Juego";
  const savedConfig = useGeneratorStore((s) => s.configs[gameId]);
  const setCurrentConfig = useGeneratorStore((s) => s.setCurrentConfig);

  const [config, setConfig] = useState<any>(
    savedConfig ?? definition?.defaultConfig ?? { size: 8, difficulty: "easy" },
  );

  useEffect(() => {
    setCurrentConfig(gameId, config);
  }, [gameId, config, setCurrentConfig]);

  const data = useMemo(() => {
    if (!definition) return null;
    return definition.generate(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition, JSON.stringify(config)]);

  function patch(p: Record<string, unknown>) {
    setConfig((c: any) => ({ ...c, ...p }));
  }

  function regenerate() {
    setConfig((c: any) => ({ ...c }));
  }

  const isWordSearch = gameId === "wordsearch";

  if (!definition) {
    return (
      <div>
        <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          &larr; Volver
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Juego no encontrado</h1>
        <p className="text-gray-600">El juego solicitado no está disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        &larr; Volver
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{label}</h1>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <DifficultySelector
          value={config.difficulty}
          onChange={(difficulty) => patch({ difficulty })}
        />

        {isWordSearch && (
          <WordSearchOptions
            wordCount={config.wordCount ?? 10}
            mode={config.mode ?? "print"}
            onChange={patch}
          />
        )}

        <Button onClick={regenerate}>Generar nuevo</Button>

        {isWordSearch && config.mode === "online" ? (
          <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
            Modo online activo
          </span>
        ) : (
          <Button onClick={() => navigate(`/print/${gameId}`)}>Ver para imprimir</Button>
        )}
      </div>

      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data && <definition.Preview data={data as any} config={config as any} />
      }
    </div>
  );
}
