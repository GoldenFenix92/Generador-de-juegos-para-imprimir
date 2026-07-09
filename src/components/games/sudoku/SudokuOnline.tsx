import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useResponsiveCell, cellFontSize } from "../../../lib/useResponsiveCell";
import type { SudokuConfig, SudokuOutput } from "./types";

interface SudokuOnlineProps {
  data: SudokuOutput;
  config: SudokuConfig;
  onComplete?: () => void;
}

function getBoxSize(size: number): { boxRows: number; boxCols: number } {
  if (size === 4) return { boxRows: 2, boxCols: 2 };
  if (size === 6) return { boxRows: 2, boxCols: 3 };
  return { boxRows: 3, boxCols: 3 };
}

function getMaxCell(size: number): number {
  if (size <= 4) return 72;
  if (size <= 6) return 64;
  return 56;
}

function isValidPlacement(
  grid: number[][],
  size: number,
  boxRows: number,
  boxCols: number,
  row: number,
  col: number,
  num: number,
): boolean {
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === num && i !== col) return false;
    if (grid[i][col] === num && i !== row) return false;
  }
  const boxR = Math.floor(row / boxRows) * boxRows;
  const boxC = Math.floor(col / boxCols) * boxCols;
  for (let r = boxR; r < boxR + boxRows; r++) {
    for (let c = boxC; c < boxC + boxCols; c++) {
      if (grid[r][c] === num && (r !== row || c !== col)) return false;
    }
  }
  return true;
}

function findConflicts(
  grid: number[][],
  size: number,
  boxRows: number,
  boxCols: number,
): Set<string> {
  const conflicts = new Set<string>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      if (val === 0) continue;
      if (!isValidPlacement(grid, size, boxRows, boxCols, r, c, val)) {
        conflicts.add(`${r},${c}`);
      }
    }
  }
  return conflicts;
}

export default function SudokuOnline({ data, onComplete }: SudokuOnlineProps) {
  const { puzzle } = data;
  const size = puzzle.length;
  const { boxRows, boxCols } = getBoxSize(size);
  const maxCell = getMaxCell(size);
  const { ref: gridRef, cellPx } = useResponsiveCell(size, maxCell, 1);

  const [grid, setGrid] = useState<number[][]>(() => puzzle.map((row) => [...row]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const completedRef = useRef(false);

  const initialCells = useMemo(() => {
    const set = new Set<string>();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (puzzle[r][c] !== 0) set.add(`${r},${c}`);
      }
    }
    return set;
  }, [puzzle]);

  const conflicts = useMemo(
    () => findConflicts(grid, size, boxRows, boxCols),
    [grid, size, boxRows, boxCols],
  );

  const isComplete = useMemo(() => {
    if (conflicts.size > 0) return false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    return true;
  }, [grid, conflicts, size]);

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (initialCells.has(`${r},${c}`)) return;
    setSelected((prev) => (prev && prev[0] === r && prev[1] === c ? null : [r, c]));
  }, [initialCells]);

  const handleNumber = useCallback((num: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (initialCells.has(`${r},${c}`)) return;
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = num;
      return next;
    });
  }, [selected, initialCells]);

  const handleClear = useCallback(() => {
    if (!selected) return;
    const [r, c] = selected;
    if (initialCells.has(`${r},${c}`)) return;
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = 0;
      return next;
    });
  }, [selected, initialCells]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= size) {
      handleNumber(n);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      handleClear();
    }
  }, [handleNumber, handleClear, size]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const cellStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: cellPx,
    height: cellPx,
    fontFamily: "var(--font-body)",
    fontSize: cellFontSize(cellPx),
    fontWeight: 700,
    cursor: "pointer",
    userSelect: "none",
  }), [cellPx]);

  const numpadCellPx = Math.min(cellPx * 1.1, 60);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div ref={gridRef} className="glass-card !p-2 w-full sm:w-fit overflow-hidden" style={{ margin: "0 auto" }}>
        <div
          className="grid gap-px select-none"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              const isInitial = initialCells.has(key);
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isConflict = conflicts.has(key);
              const borderRight = (c + 1) % boxCols === 0 && c < size - 1;
              const borderBottom = (r + 1) % boxRows === 0 && r < size - 1;

              return (
                <div
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    ...cellStyle,
                    color: isConflict ? "#DC2626" : isInitial ? "var(--text-primary)" : "var(--accent)",
                    backgroundColor: isSelected
                      ? "var(--accent-light)"
                      : isConflict
                        ? "#FEE2E2"
                        : "var(--card-bg)",
                    borderRight: borderRight ? "2px solid var(--text-primary)" : "0.5px solid var(--card-border)",
                    borderBottom: borderBottom ? "2px solid var(--text-primary)" : "0.5px solid var(--card-border)",
                    outline: isSelected ? "2px solid var(--accent)" : undefined,
                    outlineOffset: -1,
                  }}
                >
                  {cell !== 0 ? cell : ""}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Numpad */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(size, 5)}, ${numpadCellPx}px)`,
        }}
      >
        {Array.from({ length: size }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="flex items-center justify-center rounded-lg font-bold transition-all active:scale-95"
            style={{
              width: numpadCellPx,
              height: numpadCellPx,
              fontSize: cellFontSize(numpadCellPx),
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--card-border)",
            }}
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="flex items-center justify-center rounded-lg font-bold transition-all active:scale-95 col-span-full"
          style={{
            height: numpadCellPx * 0.7,
            fontSize: "0.8rem",
            backgroundColor: "var(--card-bg)",
            color: "var(--text-muted)",
            border: "1px solid var(--card-border)",
          }}
        >
          Borrar
        </button>
      </div>

      {isComplete && (
        <div className="glass-card p-4 text-center w-full max-w-md">
          <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
            Sudoku completado!
          </p>
        </div>
      )}
    </div>
  );
}
