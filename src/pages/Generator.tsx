import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getGameDefinition } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { DifficultySelector } from "../components/ui/DifficultySelector";
import { useGeneratorStore } from "../store/generator";
import type { GameConfig } from "../types/games";
import type { WordSearchMode, GenerationMode, ThemeId } from "../components/games/wordsearch/types";
import { THEMES } from "../components/games/wordsearch/types";

const GAME_LABELS: Record<string, string> = {
  wordsearch: "Sopa de Letras",
  sudoku: "Sudoku",
  maze: "Laberinto",
  tictactoe: "Tres en Raya",
};

const WORD_COUNT_OPTIONS = [5, 10, 15, 20];

interface WSConfig extends GameConfig {
  wordCount: number;
  mode: WordSearchMode;
  generationMode: GenerationMode;
  theme?: ThemeId;
  customWords?: string[];
}

function WordSearchOptions({
  wordCount,
  mode,
  generationMode,
  theme,
  customWords,
  onChange,
}: {
  wordCount: number;
  mode: WordSearchMode;
  generationMode: GenerationMode;
  theme?: ThemeId;
  customWords?: string[];
  onChange: (patch: Partial<WSConfig>) => void;
}) {
  const [customText, setCustomText] = useState(customWords?.join(", ") ?? "");

  function handleCustomBlur() {
    const words = customText
      .split(/[,;\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
    onChange({ customWords: words });
  }

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Modo de generación</label>
        <Select
          value={generationMode}
          onChange={(e) => onChange({ generationMode: e.target.value as GenerationMode })}
        >
          <option value="random">Aleatorio</option>
          <option value="themed">Temático</option>
          <option value="custom">Personalizado</option>
        </Select>
      </div>

      {generationMode === "themed" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Temática</label>
          <Select
            value={theme ?? THEMES[0].id}
            onChange={(e) => onChange({ theme: e.target.value as ThemeId })}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </Select>
        </div>
      )}

      {generationMode === "custom" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Palabras personalizadas (5-20, separadas por comas)
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onBlur={handleCustomBlur}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="ej: PERRO, GATO, CASA, SOL, LUNA"
          />
        </div>
      )}

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

  const storedData = useGeneratorStore((s) => s.data[gameId]);
  const setCurrentConfig = useGeneratorStore((s) => s.setCurrentConfig);
  const setGeneratedData = useGeneratorStore((s) => s.setGeneratedData);

  const [config, setConfig] = useState<any>(
    storedData?.config ?? definition?.defaultConfig ?? { size: 8, difficulty: "easy" },
  );

  const configsMatch = storedData && JSON.stringify(storedData.config) === JSON.stringify(config);
  const [data, setData] = useState<any>(configsMatch ? storedData.output : null);

  function patch(p: Record<string, unknown>) {
    setConfig((prev: any) => {
      const next = { ...prev, ...p };
      setCurrentConfig(gameId, next);
      return next;
    });
  }

  function regenerate() {
    if (!definition) return;
    setCurrentConfig(gameId, config);
    const newData = definition.generate(config);
    setData(newData);
    setGeneratedData(gameId, config, newData);
  }

  const isWordSearch = gameId === "wordsearch";
  const previewConfig = isWordSearch ? { ...config, showSolution: true } : config;

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

      {isWordSearch && (
        <>
          <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <p className="mb-1 font-medium">Instrucciones:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Selecciona las opciones de generacion (dificultad, modo, palabras, etc.).</li>
              <li>Haz clic en <strong>"Generar nueva Sopa de Letras"</strong> para crear el puzzle.</li>
              <li>
                Elige <strong>"Ver para imprimir"</strong> para descargar en PDF o imprimir, o selecciona el modo
                "Jugar online" y presiona el boton para jugar en pantalla.
              </li>
            </ol>
          </div>

          <details className="mb-4 rounded-lg border border-gray-200 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Caracteristicas de cada dificultad
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="px-2 py-1 font-medium">Dificultad</th>
                    <th className="px-2 py-1 font-medium">Direcciones</th>
                    <th className="px-2 py-1 font-medium">Palabras</th>
                    <th className="px-2 py-1 font-medium">Intersecciones</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="px-2 py-1 font-medium">Facil</td>
                    <td className="px-2 py-1">2 (→ ↓)</td>
                    <td className="px-2 py-1">Cortas (3-5 letras)</td>
                    <td className="px-2 py-1">No</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-2 py-1 font-medium">Medio</td>
                    <td className="px-2 py-1">3 (→ ↓ ↘)</td>
                    <td className="px-2 py-1">Cortas y medias (3-8 letras)</td>
                    <td className="px-2 py-1">No</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-2 py-1 font-medium">Dificil</td>
                    <td className="px-2 py-1">6 (→← ↓↑ ↘↗)</td>
                    <td className="px-2 py-1">Cortas a largas</td>
                    <td className="px-2 py-1">Si</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-medium">Experto</td>
                    <td className="px-2 py-1">8 (todas)</td>
                    <td className="px-2 py-1">Cortas a largas</td>
                    <td className="px-2 py-1">Si + concatenadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <DifficultySelector
          value={config.difficulty}
          onChange={(difficulty) => patch({ difficulty })}
        />

        {isWordSearch && (
          <WordSearchOptions
            wordCount={config.wordCount ?? 10}
            mode={config.mode ?? "print"}
            generationMode={config.generationMode ?? "random"}
            theme={config.theme}
            customWords={config.customWords}
            onChange={patch}
          />
        )}

        <Button onClick={regenerate}>Generar nueva Sopa de Letras</Button>

        {isWordSearch && config.mode === "online" ? (
          <Button onClick={() => navigate(`/play/${gameId}`)}>Jugar online</Button>
        ) : (
          <Button onClick={() => navigate(`/print/${gameId}`)}>Ver para imprimir</Button>
        )}
      </div>

      {
        data && <definition.Preview data={data as any} config={previewConfig as any} />
      }
    </div>
  );
}
