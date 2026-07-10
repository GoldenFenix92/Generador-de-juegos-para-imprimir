import { useResponsiveCell } from "../../../lib/useResponsiveCell";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

interface TicTacToeProps {
  data: TicTacToeOutput;
  config: TicTacToeConfig;
}

function getMaxCell(gridSize: number): number {
  if (gridSize <= 3) return 100;
  return 80;
}

export default function TicTacToe({ data }: TicTacToeProps) {
  const { grid } = data;
  const gridSize = grid.length;
  const maxCell = getMaxCell(gridSize);
  const { ref, cellPx } = useResponsiveCell(gridSize, maxCell, 4);

  return (
    <div className="flex justify-center w-full">
      <div ref={ref} className="glass-card !p-2 w-full sm:w-fit overflow-hidden" style={{ margin: "0 auto" }}>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="flex items-center justify-center bg-white font-bold"
                style={{ width: cellPx, height: cellPx, color: "var(--text-primary)", fontSize: cellPx * 0.5 }}
              >
                {cell ?? ""}
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

export { generateTicTacToe } from "./generate";
export type { TicTacToeConfig, TicTacToeOutput } from "./types";
