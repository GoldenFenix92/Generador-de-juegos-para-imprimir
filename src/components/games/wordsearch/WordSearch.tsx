import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { WordSearchConfig, WordSearchOutput } from "./types";

interface WordSearchProps {
  data: WordSearchOutput;
  config: WordSearchConfig;
  onComplete?: () => void;
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

const GAP_PX = 4;
const GRID_PAD = 16;

function useResponsiveCell(cols: number, maxCell = 36) {
  const ref = useRef<HTMLDivElement>(null);
  const [cellPx, setCellPx] = useState(maxCell);

  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const avail = ref.current.clientWidth - GRID_PAD;
      const gaps = (cols - 1) * GAP_PX;
      const px = Math.floor((avail - gaps) / cols);
      setCellPx(Math.min(Math.max(px, 16), maxCell));
    }

    calc();
    const observer = new ResizeObserver(calc);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [cols, maxCell]);

  return { ref, cellPx };
}

function cellFontSize(cellPx: number): string {
  if (cellPx >= 32) return "0.875rem";
  if (cellPx >= 24) return "0.75rem";
  if (cellPx >= 18) return "0.7rem";
  return "0.625rem";
}

function OnlineGrid({ data, onComplete }: { data: WordSearchOutput; onComplete?: () => void }) {
  const { grid, words } = data;
  const cols = grid[0]?.length ?? 0;
  const { ref: gridRef, cellPx } = useResponsiveCell(cols);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const completedRef = useRef(false);

  useEffect(() => {
    if (found.size === words.length && words.length > 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [found, words.length, onComplete]);

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
  useEffect(() => { foundRef.current = found; }, [found]);

  const handleStart = useCallback((row: number, col: number) => {
    selecting.current = true;
    startRef.current = [row, col];
    endRef.current = [row, col];
    setHighlighted(new Set([`${row},${col}`]));
  }, []);

  const handleMove = useCallback((row: number, col: number) => {
    if (!selecting.current || !startRef.current) return;
    endRef.current = [row, col];
    const [sr, sc] = startRef.current;
    const cells = getLineCells(sr, sc, row, col);
    setHighlighted(new Set(cells.map(([r, c]) => `${r},${c}`)));
  }, []);

  const handleEnd = useCallback(() => {
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
  }, [grid, words]);

  useEffect(() => {
    function onMouseUp() { handleEnd(); }
    function onTouchEnd() { handleEnd(); }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleEnd]);

  const cellStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: cellPx,
    height: cellPx,
    fontFamily: "var(--font-body)",
    fontSize: cellFontSize(cellPx),
    fontWeight: 700,
    borderRadius: "4px",
    transition: "all 0.15s ease",
  }), [cellPx]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div ref={gridRef} className="glass-card !p-2 w-full overflow-hidden">
        <div
          className="grid gap-1 touch-none select-none"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cellPx}px)` }}
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
                  data-row={r}
                  data-col={c}
                  onMouseDown={() => handleStart(r, c)}
                  onMouseEnter={() => handleMove(r, c)}
                  onTouchStart={(e) => { e.preventDefault(); handleStart(r, c); }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    if (!touch) return;
                    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
                    const cellEl = el?.closest("[data-row]") as HTMLElement | null;
                    if (!cellEl) return;
                    const tr = parseInt(cellEl.getAttribute("data-row")!, 10);
                    const tc = parseInt(cellEl.getAttribute("data-col")!, 10);
                    handleMove(tr, tc);
                  }}
                  style={{
                    ...cellStyle,
                    backgroundColor: isFound
                      ? "rgba(16, 185, 129, 0.3)"
                      : isHighlighted
                        ? "rgba(250, 204, 21, 0.4)"
                        : "var(--card-bg)",
                    color: isFound
                      ? "var(--text-primary)"
                      : isHighlighted
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    cursor: "pointer",
                  }}
                  className="hover:brightness-110"
                >
                  {cell}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center px-2">
        {words.map((word) => {
          const wFound = found.has(word);
          return (
            <span
              key={word}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                wFound
                  ? "bg-emerald-500/20 text-emerald-500 line-through"
                  : "glass-card !px-3 !py-1 text-muted"
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>

      {found.size === words.length && (
        <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
          Encontraste todas las palabras!
        </p>
      )}
    </div>
  );
}

function PreviewGrid({ data }: { data: WordSearchOutput }) {
  const { grid, words, positions } = data;
  const cols = grid[0]?.length ?? 0;
  const { ref: gridRef, cellPx } = useResponsiveCell(cols);

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

  const cellStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: cellPx,
    height: cellPx,
    fontFamily: "var(--font-body)",
    fontSize: cellFontSize(cellPx),
    fontWeight: 700,
    borderRadius: "4px",
    transition: "all 0.15s ease",
  }), [cellPx]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div ref={gridRef} className="glass-card !p-2 w-full overflow-hidden">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cellPx}px)` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  ...cellStyle,
                  backgroundColor: isWordCell(r, c)
                    ? "rgba(250, 204, 21, 0.35)"
                    : "var(--card-bg)",
                  color: isWordCell(r, c)
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                }}
              >
                {cell}
              </div>
            )),
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center px-2">
        {words.map((word) => (
          <span
            key={word}
            className="glass-card !px-3 !py-1 text-sm font-medium text-muted"
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
  const cols = grid[0]?.length ?? 0;
  const { ref: gridRef, cellPx } = useResponsiveCell(cols);

  const cellStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: cellPx,
    height: cellPx,
    fontFamily: "var(--font-body)",
    fontSize: cellFontSize(cellPx),
    fontWeight: 700,
    borderRadius: "4px",
    transition: "all 0.15s ease",
  }), [cellPx]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div ref={gridRef} className="glass-card !p-2 w-full overflow-hidden">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cellPx}px)` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  ...cellStyle,
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text-primary)",
                }}
              >
                {cell}
              </div>
            )),
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center px-2">
        {words.map((word) => (
          <span
            key={word}
            className="glass-card !px-3 !py-1 text-sm font-medium text-muted"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WordSearch({ data, config, onComplete }: WordSearchProps) {
  if (config.showSolution) return <PreviewGrid data={data} />;
  if (config.mode === "online") return <OnlineGrid data={data} onComplete={onComplete} />;
  return <PrintGrid data={data} />;
}

export { generateWordSearch } from "./generate";
export type { WordSearchConfig, WordSearchOutput } from "./types";
