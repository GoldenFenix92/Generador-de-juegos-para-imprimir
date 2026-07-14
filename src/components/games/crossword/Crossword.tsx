import { useMemo } from "react";
import { useResponsiveCell } from "../../../lib/useResponsiveCell";
import type { CrosswordConfig, CrosswordOutput } from "./types";

interface CrosswordProps {
  data: CrosswordOutput;
  config: CrosswordConfig;
}

function getMaxCell(size: number): number {
  if (size <= 7) return 48;
  if (size <= 9) return 40;
  if (size <= 11) return 34;
  return 28;
}

export default function Crossword({ data }: CrosswordProps) {
  const size = data.width;
  const maxCell = getMaxCell(size);
  const { ref, cellPx } = useResponsiveCell(size, maxCell, 2);

  const acrossClues = useMemo(
    () => data.clues.filter((c) => c.direction === "across"),
    [data.clues],
  );
  const downClues = useMemo(
    () => data.clues.filter((c) => c.direction === "down"),
    [data.clues],
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        ref={ref}
        className="glass-card !p-2 w-full sm:w-fit overflow-hidden"
        style={{ margin: "0 auto" }}
      >
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {Array.from({ length: size }, (_, r) =>
            Array.from({ length: size }, (_, c) => {
              const isBlock = data.blocks[r][c];
              const letter = data.grid[r][c];
              const num = data.numbers[r][c];
              const isEmpty = !isBlock && !letter;

              return (
                <div
                  key={`${r},${c}`}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    backgroundColor: isBlock ? "#111827" : "var(--card-bg)",
                  }}
                  className="flex items-center justify-center relative"
                >
                  {!isBlock && letter ? (
                    <span
                      className="font-bold select-none"
                      style={{
                        fontSize: cellPx * 0.45,
                        color: "var(--text-primary)",
                      }}
                    >
                      {letter}
                    </span>
                  ) : isEmpty ? (
                    <span
                      className="select-none"
                      style={{ fontSize: cellPx * 0.45, color: "var(--text-muted)" }}
                    >
                      {""}
                    </span>
                  ) : null}
                  {!isBlock && num ? (
                    <span
                      className="absolute select-none"
                      style={{
                        top: 1,
                        left: 2,
                        fontSize: Math.max(cellPx * 0.25, 8),
                        lineHeight: 1,
                        color: "var(--text-muted)",
                      }}
                    >
                      {num}
                    </span>
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {data.clues.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
          {acrossClues.length > 0 && (
            <div className="flex-1">
              <p className="mb-1 text-sm font-bold text-primary">Horizontales:</p>
              <ol className="list-inside list-decimal space-y-0.5 text-xs text-muted">
                {acrossClues.map((clue) => (
                  <li key={clue.number}>
                    <span className="font-medium text-primary">{clue.clue}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {downClues.length > 0 && (
            <div className="flex-1">
              <p className="mb-1 text-sm font-bold text-primary">Verticales:</p>
              <ol className="list-inside list-decimal space-y-0.5 text-xs text-muted">
                {downClues.map((clue) => (
                  <li key={clue.number}>
                    <span className="font-medium text-primary">{clue.clue}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { generateCrossword } from "./generate";
export type { CrosswordConfig, CrosswordOutput } from "./types";
