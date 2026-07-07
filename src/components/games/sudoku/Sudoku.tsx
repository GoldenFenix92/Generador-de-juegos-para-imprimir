import type { SudokuConfig, SudokuOutput } from "./types";

interface SudokuProps {
  data: SudokuOutput;
  config: SudokuConfig;
}

export default function Sudoku({ data }: SudokuProps) {
  const { puzzle, solution } = data;

  return (
    <div className="flex flex-col items-center gap-6 w-full overflow-x-auto">
      <div className="grid grid-cols-9 gap-px bg-gray-300">
        {puzzle.map((row, r) =>
          row.map((cell, c) => {
            const isInitial = solution[r][c] !== 0 && puzzle[r][c] !== 0;
            const isClue = cell !== 0;
            const borderRight = (c + 1) % 3 === 0 && c < 8;
            const borderBottom = (r + 1) % 3 === 0 && r < 8;

            return (
              <div
                key={`${r}-${c}`}
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-sm font-mono ${
                  isClue ? "font-bold text-gray-900" : "text-blue-600"
                } bg-white ${borderRight ? "border-r-2 border-r-gray-800" : ""} ${
                  borderBottom ? "border-b-2 border-b-gray-800" : ""
                }`}
              >
                {isInitial ? solution[r][c] : cell !== 0 ? cell : ""}
              </div>
            );
          }),
        )}
      </div>

      <details className="w-full max-w-md">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Ver solución
        </summary>
        <div className="mt-2 grid grid-cols-9 gap-px bg-gray-200">
          {solution.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="flex h-7 w-7 items-center justify-center bg-white text-xs text-gray-600"
              >
                {cell}
              </div>
            )),
          )}
        </div>
      </details>
    </div>
  );
}

export { generateSudoku } from "./generate";
export type { SudokuConfig, SudokuOutput } from "./types";
