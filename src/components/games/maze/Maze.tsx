import type { MazeConfig, MazeOutput } from "./types";

interface MazeProps {
  data: MazeOutput;
  config: MazeConfig;
}

export default function Maze({ data }: MazeProps) {
  const { walls } = data;

  return (
    <div className="flex justify-center">
      <div
        className="grid gap-px bg-gray-300"
        style={{ gridTemplateColumns: `repeat(${walls[0].length}, 20px)` }}
      >
        {walls.map((row, r) =>
          row.map((isWall, c) => (
            <div
              key={`${r}-${c}`}
              className={`h-5 w-5 ${
                r === 0 && c === 0
                  ? "bg-green-500"
                  : r === walls.length - 1 && c === walls[0].length - 1
                    ? "bg-red-500"
                    : isWall
                      ? "bg-gray-900"
                      : "bg-white"
              }`}
            />
          )),
        )}
      </div>
    </div>
  );
}

export { generateMaze } from "./generate";
export type { MazeConfig, MazeOutput } from "./types";
