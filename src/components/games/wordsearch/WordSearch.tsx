import { useState } from "react";
import type { WordSearchConfig, WordSearchOutput } from "./types";

interface WordSearchProps {
  data: WordSearchOutput;
  config: WordSearchConfig;
}

function PreviewGrid({ data }: { data: WordSearchOutput }) {
  const { grid, words, positions } = data;

  const wordCells = new Map<string, string[]>();
  for (const pos of positions) {
    const cells: string[] = [];
    for (let i = 0; i < pos.word.length; i++) {
      const r = pos.row + pos.direction[0] * i;
      const c = pos.col + pos.direction[1] * i;
      cells.push(`${r},${c}`);
    }
    wordCells.set(pos.word, cells);
  }

  function isWordCell(row: number, col: number): boolean {
    const key = `${row},${col}`;
    for (const cells of wordCells.values()) {
      if (cells.includes(key)) return true;
    }
    return false;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="grid gap-px bg-gray-300"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, 36px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex h-9 w-9 items-center justify-center text-sm font-mono font-bold ${
                isWordCell(r, c) ? "bg-yellow-200 text-gray-900" : "bg-white text-gray-400"
              }`}
            >
              {cell}
            </div>
          )),
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <span
            key={word}
            className="rounded-md bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

function OnlineGrid({ data }: { data: WordSearchOutput }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [found, setFound] = useState<Set<string>>(new Set());
  const { grid, words, positions } = data;

  const wordCells = new Map<string, string[]>();
  for (const pos of positions) {
    const cells: string[] = [];
    for (let i = 0; i < pos.word.length; i++) {
      const r = pos.row + pos.direction[0] * i;
      const c = pos.col + pos.direction[1] * i;
      cells.push(`${r},${c}`);
    }
    wordCells.set(pos.word, cells);
  }

  function toggleCell(row: number, col: number) {
    const key = `${row},${col}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);

      for (const word of words) {
        if (found.has(word)) continue;
        const cells = wordCells.get(word);
        if (cells && cells.every((k) => next.has(k))) {
          setFound((f) => new Set(f).add(word));
        }
      }

      return next;
    });
  }

  function isCellFound(row: number, col: number): boolean {
    for (const word of found) {
      const cells = wordCells.get(word);
      if (cells?.includes(`${row},${col}`)) return true;
    }
    return false;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="grid gap-px bg-gray-300"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, 36px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const isSel = selected.has(key);
            const isFnd = isCellFound(r, c);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCell(r, c)}
                className={`flex h-9 w-9 items-center justify-center text-sm font-mono font-bold transition ${
                  isFnd
                    ? "bg-green-300 text-green-900"
                    : isSel
                      ? "bg-yellow-200 text-gray-900"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                {cell}
              </button>
            );
          }),
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map((word) => {
          const wFound = found.has(word);
          const allSelected = wordCells.get(word)?.every((k) => selected.has(k));
          return (
            <span
              key={word}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                wFound
                  ? "bg-green-200 text-green-800 line-through"
                  : allSelected
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>

      {found.size === words.length && (
        <p className="text-lg font-bold text-green-600">¡Encontraste todas las palabras!</p>
      )}
    </div>
  );
}

function PrintGrid({ data }: { data: WordSearchOutput }) {
  const { grid, words } = data;
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="grid gap-px bg-gray-300"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, 36px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="flex h-9 w-9 items-center justify-center bg-white text-sm font-mono font-bold text-gray-900"
            >
              {cell}
            </div>
          )),
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <span
            key={word}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WordSearch({ data, config }: WordSearchProps) {
  if (config.showSolution) return <PreviewGrid data={data} />;
  if (config.mode === "online") return <OnlineGrid data={data} />;
  return <PrintGrid data={data} />;
}

export { generateWordSearch } from "./generate";
export type { WordSearchConfig, WordSearchOutput } from "./types";
