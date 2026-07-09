import { useMemo } from "react";
import { useResponsiveCell, cellFontSize } from "../../../lib/useResponsiveCell";
import type { SudokuConfig, SudokuOutput } from "./types";

interface SudokuProps {
  data: SudokuOutput;
  config: SudokuConfig;
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

export default function Sudoku({ data }: SudokuProps) {
  const { puzzle, solution } = data;
  const size = puzzle.length;
  const { boxRows, boxCols } = getBoxSize(size);
  const maxCell = getMaxCell(size);
  const { ref: gridRef, cellPx } = useResponsiveCell(size, maxCell, 1);
  const { ref: solRef, cellPx: solCellPx } = useResponsiveCell(size, Math.min(maxCell, 40), 1);

  const cellStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: cellPx,
    height: cellPx,
    fontFamily: "var(--font-body)",
    fontSize: cellFontSize(cellPx),
    fontWeight: 700,
  }), [cellPx]);

  const solCellStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: solCellPx,
    height: solCellPx,
    fontFamily: "var(--font-body)",
    fontSize: cellFontSize(solCellPx),
    fontWeight: 600,
    color: "var(--text-muted)",
  }), [solCellPx]);

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
          {puzzle.map((row, r) =>
            row.map((cell, c) => {
              const isClue = cell !== 0;
              const borderRight = (c + 1) % boxCols === 0 && c < size - 1;
              const borderBottom = (r + 1) % boxRows === 0 && r < size - 1;

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    ...cellStyle,
                    color: isClue ? "var(--text-primary)" : "var(--accent)",
                    backgroundColor: "var(--card-bg)",
                    borderRight: borderRight ? "2px solid var(--text-primary)" : "0.5px solid var(--card-border)",
                    borderBottom: borderBottom ? "2px solid var(--text-primary)" : "0.5px solid var(--card-border)",
                  }}
                >
                  {isClue ? cell : ""}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <details className="w-full max-w-md">
        <summary className="cursor-pointer text-sm font-medium transition-all" style={{ color: "var(--text-muted)" }}>
          Ver solucion
        </summary>
        <div
          ref={solRef}
          className="mt-2 p-2 w-full sm:w-fit overflow-hidden"
          style={{ margin: "0 auto", border: "0.5px solid var(--card-border)", borderRadius: "var(--radius-sm)" }}
        >
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${size}, ${solCellPx}px)`,
              justifyContent: "center",
              backgroundColor: "#9CA3AF",
            }}
          >
            {solution.map((row, r) =>
              row.map((cell, c) => {
                const borderRight = (c + 1) % boxCols === 0 && c < size - 1;
                const borderBottom = (r + 1) % boxRows === 0 && r < size - 1;

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      ...solCellStyle,
                      backgroundColor: "var(--card-bg)",
                      borderRight: borderRight ? "2px solid var(--text-primary)" : "0.5px solid var(--card-border)",
                      borderBottom: borderBottom ? "2px solid var(--text-primary)" : "0.5px solid var(--card-border)",
                    }}
                  >
                    {cell}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

export { generateSudoku } from "./generate";
export type { SudokuConfig, SudokuOutput } from "./types";
