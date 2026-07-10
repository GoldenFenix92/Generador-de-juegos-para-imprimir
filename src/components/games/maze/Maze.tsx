import { useMemo } from "react";
import { useResponsiveCell } from "../../../lib/useResponsiveCell";
import type { MazeConfig, MazeOutput } from "./types";

interface MazeProps {
  data: MazeOutput;
  config: MazeConfig;
}

function getMaxCell(wallCols: number): number {
  if (wallCols <= 11) return 48;
  if (wallCols <= 17) return 36;
  if (wallCols <= 25) return 28;
  return 22;
}

export default function Maze({ data, config }: MazeProps) {
  const { walls, solution } = data;
  const wallCols = walls[0].length;
  const maxCell = getMaxCell(wallCols);
  const { ref, cellPx } = useResponsiveCell(wallCols, maxCell, 1);

  const solutionSet = useMemo(() => {
    if (!config.showSolution) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < solution.length; i++) {
      const [r, c] = solution[i];
      set.add(`${r * 2 + 1},${c * 2 + 1}`);
      if (i > 0) {
        const prev = solution[i - 1];
        set.add(`${prev[0] + r + 1},${prev[1] + c + 1}`);
      }
    }
    return set;
  }, [config.showSolution, solution]);

  return (
    <div className="flex justify-center w-full">
      <div
        ref={ref}
        className="glass-card !p-2 w-full sm:w-fit overflow-hidden"
        style={{ margin: "0 auto" }}
      >
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${wallCols}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {walls.map((row, r) =>
            row.map((isWall, c) => {
              const key = `${r},${c}`;
              const isSolution = config.showSolution && solutionSet.has(key);
              const isStart = r === 1 && c === 1;
              const isEnd = r === walls.length - 2 && c === wallCols - 2;

              return (
                <div
                  key={key}
                  style={{ width: cellPx, height: cellPx }}
                  className={
                    isStart
                      ? "bg-green-500"
                      : isEnd
                        ? "bg-red-500"
                        : isSolution
                          ? "bg-blue-400"
                          : isWall
                            ? "bg-gray-900"
                            : "bg-white"
                  }
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

export { generateMaze } from "./generate";
export type { MazeConfig, MazeOutput } from "./types";
