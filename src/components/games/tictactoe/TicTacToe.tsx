import type { TicTacToeConfig, TicTacToeOutput } from "./types";

interface TicTacToeProps {
  data: TicTacToeOutput;
  config: TicTacToeConfig;
}

export default function TicTacToe({ data }: TicTacToeProps) {
  const { grid } = data;

  return (
    <div className="flex justify-center w-full overflow-x-auto">
      <div className="grid grid-cols-3 gap-1 bg-gray-300 p-1">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center bg-white text-2xl sm:text-3xl font-bold text-gray-800"
            >
              {cell ?? ""}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

export { generateTicTacToe } from "./generate";
export type { TicTacToeConfig, TicTacToeOutput } from "./types";
