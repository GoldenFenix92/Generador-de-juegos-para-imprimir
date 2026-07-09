import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameDefinition } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import type { GameConfig } from "../types/games";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { DifficultySelector } from "../components/ui/DifficultySelector";
import { useGeneratorStore } from "../store/generator";
import type { WordSearchMode, GenerationMode, ThemeId } from "../components/games/wordsearch/types";
import { THEMES } from "../components/games/wordsearch/types";

const GAME_LABELS: Record<string, string> = {
  wordsearch: "Sopa de Letras",
  sudoku: "Sudoku",
  maze: "Laberinto",
  tictactoe: "Tres en Raya",
};

const SHEET_LABELS: Record<string, string> = {
  wordsearch: "sopa",
  sudoku: "sudoku",
  maze: "laberinto",
  tictactoe: "tablero",
};

const WORD_COUNT_OPTIONS = [5, 10, 15, 20];

interface WSConfig extends GameConfig {
  wordCount: number;
  mode: WordSearchMode;
  generationMode: GenerationMode;
  theme?: ThemeId;
  customWords?: string[];
  sheetCount: number;
  showSolutionInPDF?: boolean;
}

function WordSearchOptions({
  wordCount,
  mode,
  generationMode,
  theme,
  customWords,
  sheetCount,
  onChange,
}: {
  wordCount: number;
  mode: WordSearchMode;
  generationMode: GenerationMode;
  theme?: ThemeId;
  customWords?: string[];
  sheetCount: number;
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
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Modo de generacion</label>
        <Select
          value={generationMode}
          onChange={(e) => onChange({ generationMode: e.target.value as GenerationMode })}
        >
          <option value="random">Aleatorio</option>
          <option value="themed">Tematico</option>
          <option value="custom">Personalizado</option>
        </Select>
      </div>

      {generationMode === "themed" && (
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Tematica</label>
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
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Palabras personalizadas (5-20, separadas por comas)
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onBlur={handleCustomBlur}
            rows={3}
            className="glass-select w-full"
            style={{ resize: "vertical" } as React.CSSProperties}
            placeholder="ej: PERRO, GATO, CASA, SOL, LUNA"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Cantidad de palabras</label>
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
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Cantidad de sopas</label>
        <Select
          value={String(sheetCount)}
          onChange={(e) => onChange({ sheetCount: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 })}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} sopa{n > 1 ? "s" : ""}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Modo</label>
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
  const sheetLabel = SHEET_LABELS[gameId] ?? "pagina";

  const storedData = useGeneratorStore((s) => s.data[gameId]);
  const setCurrentConfig = useGeneratorStore((s) => s.setCurrentConfig);
  const setGeneratedData = useGeneratorStore((s) => s.setGeneratedData);
  const clearGeneratedData = useGeneratorStore((s) => s.clearGeneratedData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<any>(
    storedData?.config ?? definition?.defaultConfig ?? { size: 8, difficulty: "easy" },
  );

  const configsMatch = storedData && JSON.stringify(storedData.config) === JSON.stringify(config);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(configsMatch ? storedData.output : null);
  const [sheetPage, setSheetPage] = useState(0);

  function patch(p: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setConfig((prev: any) => {
      const next = { ...prev, ...p };
      setCurrentConfig(gameId, next);
      return next;
    });
  }

  function regenerate() {
    if (!definition) return;
    setCurrentConfig(gameId, config);
    const count = config.sheetCount ?? 1;
    const newData = count > 1
      ? Array.from({ length: count }, () => definition.generate(config))
      : definition.generate(config);
    setData(newData);
    setSheetPage(0);
    setGeneratedData(gameId, config, newData);
  }

  function clearData() {
    setData(null);
    clearGeneratedData(gameId);
  }

  const isWordSearch = gameId === "wordsearch";
  const previewConfig = { ...config, showSolution: true };

  if (!definition) {
    return (
      <div>
        <Button
          variant="tertiary"
          slideIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
          onClick={() => navigate("/")}
        >
          Volver
        </Button>
        <h1 className="mb-6 text-2xl font-bold text-primary">Juego no encontrado</h1>
        <p className="text-muted">El juego solicitado no esta disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="tertiary"
        className="mb-4"
        slideIcon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        }
        onClick={() => navigate("/")}
      >
        Volver
      </Button>
      <h1 className="mb-6 text-2xl font-bold text-primary">{label}</h1>

      {isWordSearch && (
        <>
          <div className="glass-card mb-4 px-5 py-4">
            <p className="mb-1 font-medium text-primary">Instrucciones:</p>
            <ol className="list-inside list-decimal space-y-1 text-muted text-sm">
              <li>Selecciona las opciones de generacion (dificultad, modo, palabras, etc.).</li>
              <li>Haz clic en <strong className="text-primary">"Generar nueva Sopa de Letras"</strong> para crear el puzzle.</li>
              <li>
                Elige <strong className="text-primary">"Ver para imprimir"</strong> para descargar en PDF o imprimir, o selecciona el modo
                "Jugar online" y presiona el boton para jugar en pantalla.
              </li>
            </ol>
          </div>

          <details className="glass-card mb-4 px-5 py-3 open:pb-5">
            <summary className="cursor-pointer text-sm font-medium text-primary select-none">
              Caracteristicas de cada dificultad
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                    <th className="px-2 py-1 font-medium text-muted">Dificultad</th>
                    <th className="px-2 py-1 font-medium text-muted">Direcciones</th>
                    <th className="px-2 py-1 font-medium text-muted">Palabras</th>
                    <th className="px-2 py-1 font-medium text-muted">Intersecciones</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                    <td className="px-2 py-1 font-medium text-primary">Facil</td>
                    <td className="px-2 py-1">2 (derecha, abajo)</td>
                    <td className="px-2 py-1">Cortas (3-5 letras)</td>
                    <td className="px-2 py-1">No</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                    <td className="px-2 py-1 font-medium text-primary">Medio</td>
                    <td className="px-2 py-1">3 (derecha, abajo, diagonal)</td>
                    <td className="px-2 py-1">Cortas y medias (3-8 letras)</td>
                    <td className="px-2 py-1">No</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                    <td className="px-2 py-1 font-medium text-primary">Dificil</td>
                    <td className="px-2 py-1">6 (las 3 anteriores + reversas)</td>
                    <td className="px-2 py-1">Cortas a largas</td>
                    <td className="px-2 py-1">Si</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-medium text-primary">Experto</td>
                    <td className="px-2 py-1">8 (todas las direcciones)</td>
                    <td className="px-2 py-1">Cortas a largas</td>
                    <td className="px-2 py-1">Si + concatenadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}

      <div className="glass-card mb-6 p-5 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-4">
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
            sheetCount={config.sheetCount ?? 1}
            onChange={patch}
          />
        )}

        {!isWordSearch && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Cantidad de {sheetLabel}s</label>
              <Select
                value={String(config.sheetCount ?? 1)}
                onChange={(e) => patch({ sheetCount: Number(e.target.value) })}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {sheetLabel}{n > 1 ? "s" : ""}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Modo</label>
              <Select
                value={config.mode ?? "print"}
                onChange={(e) => patch({ mode: e.target.value })}
              >
                <option value="print">Para imprimir</option>
                <option value="online">Jugar online</option>
              </Select>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showSolutionInPDF ?? false}
              onChange={(e) => patch({ showSolutionInPDF: e.target.checked })}
              className="h-4 w-4 rounded accent-purple-600"
            />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Incluir solucion en PDF
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          {data && (
            <Button
              variant="tertiary"
              className="w-full sm:w-auto"
              slideIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={clearData}
            >
              Limpiar
            </Button>
          )}

          <Button
            variant="primary"
            className="w-full sm:w-auto"
            slideIcon={
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            onClick={regenerate}
          >
            Generar {label}
          </Button>

          {(config.mode ?? "print") === "online" ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              slideIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              onClick={() => navigate(`/play/${gameId}`)}
            >
              Jugar online
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              slideIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              }
              onClick={() => navigate(`/print/${gameId}`)}
            >
              Ver para imprimir
            </Button>
          )}
        </div>
      </div>

      {data && (
        <>
          {Array.isArray(data) && data.length > 1 && (
            <div className="glass-card mb-4 p-3 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={sheetPage === 0}
                onClick={() => setSheetPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-30 hover:bg-white/10"
                style={{ color: "var(--text-primary)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {sheetLabel} {sheetPage + 1} de {data.length}
              </span>
              <button
                type="button"
                disabled={sheetPage === data.length - 1}
                onClick={() => setSheetPage((p) => p + 1)}
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
          <definition.Preview
            data={Array.isArray(data) ? (data[sheetPage] as any) : (data as any)}
            config={previewConfig as any}
          />
        </>
      )}
    </div>
  );
}
