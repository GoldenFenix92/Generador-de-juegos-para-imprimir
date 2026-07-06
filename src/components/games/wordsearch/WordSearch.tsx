import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { WordSearchConfig, WordSearchOutput } from "./types";

interface WordSearchProps {
  data: WordSearchOutput;
  config: WordSearchConfig;
}

function getLineCells(
  startRow: number, startCol: number,
  endRow: number, endCol: number,
): [number, number][] {
  const dr = endRow - startRow;
  const dc = endCol - startCol;

  if (dr === 0 && dc === 0) {
    return [[startRow, startCol]];
  }

  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
    return [];
  }

  const stepRow = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepCol = dc === 0 ? 0 : dc / Math.abs(dc);
  const steps = Math.max(Math.abs(dr), Math.abs(dc));

  const cells: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([startRow + stepRow * i, startCol + stepCol * i]);
  }
  return cells;
}

function OnlineGrid({ data }: { data: WordSearchOutput }) {
  const { grid, words } = data;
  const [found, setFound] = useState<Set<string>>(new Set());
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const foundCellKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const w of found) {
      const pos = data.positions.find((p) => p.word === w);
      if (!pos) continue;
      for (let i = 0; i < w.length; i++) {
        keys.add(`${pos.row + pos.direction[0] * i},${pos.col + pos.direction[1] * i}`);
      }
    }
    return keys;
  }, [found, data.positions]);

  const selecting = useRef(false);
  const startRef = useRef<[number, number] | null>(null);
  const endRef = useRef<[number, number] | null>(null);
  const foundRef = useRef(found);
  foundRef.current = found;

  const handleMouseDown = useCallback((row: number, col: number) => {
    selecting.current = true;
    startRef.current = [row, col];
    endRef.current = [row, col];
    setHighlighted(new Set([`${row},${col}`]));
  }, []);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!selecting.current || !startRef.current) return;
    endRef.current = [row, col];
    const [sr, sc] = startRef.current;
    const cells = getLineCells(sr, sc, row, col);
    setHighlighted(new Set(cells.map(([r, c]) => `${r},${c}`)));
  }, []);

  useEffect(() => {
    function onMouseUp() {
      if (!selecting.current) return;
      selecting.current = false;

      const start = startRef.current;
      const end = endRef.current;
      startRef.current = null;
      endRef.current = null;
      setHighlighted(new Set());

      if (!start || !end) return;
      const [sr, sc] = start;
      const [er, ec] = end;
      const cells = getLineCells(sr, sc, er, ec);
      if (cells.length < 2) return;

      const wordStr = cells.map(([r, c]) => grid[r][c]).join("");
      const reversed = wordStr.split("").reverse().join("");

      for (const w of words) {
        if (foundRef.current.has(w)) continue;
        if (w === wordStr || w === reversed) {
          setFound((prev) => new Set(prev).add(w));
          break;
        }
      }
    }

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [grid, words]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="grid gap-px bg-gray-300 select-none"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, 36px)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const isFound = foundCellKeys.has(key);
            const isHighlighted = highlighted.has(key);

            return (
              <button
                key={key}
                type="button"
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                className={`flex h-9 w-9 items-center justify-center text-sm font-mono font-bold transition ${
                  isFound
                    ? "bg-green-300 text-green-900"
                    : isHighlighted
                      ? "bg-yellow-300 text-gray-900"
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
          return (
            <span
              key={word}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                wFound
                  ? "bg-green-200 text-green-800 line-through"
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
