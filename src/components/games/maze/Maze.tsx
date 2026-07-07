import type { MazeConfig, MazeOutput } from "./types";

interface MazeProps {
  data: MazeOutput;
  config: MazeConfig;
}

export default function Maze({ data }: MazeProps) {
  const { walls } = data;

  return (
    <div className="flex justify-center w-full overflow-x-auto">
      <div
        className="grid gap-px bg-gray-300"
        style={{ gridTemplateColumns: `repeat(${walls[0].length}, 18px)` }}
      >
        {walls.map((row, r) =>
          row.map((isWall, c) => (
            <div
              key={`${r}-${c}`}
              style={{ width: 18, height: 18 }}
              className={`${
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
