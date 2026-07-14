import { useState, useMemo, useCallback, useRef } from "react";
import { useResponsiveCell } from "../../../lib/useResponsiveCell";
import type { CrosswordConfig, CrosswordOutput, CrosswordClue } from "./types";

interface CrosswordOnlineProps {
  data: CrosswordOutput;
  config: CrosswordConfig;
  onComplete?: () => void;
}

function getMaxCell(size: number): number {
  if (size <= 7) return 48;
  if (size <= 9) return 40;
  if (size <= 11) return 34;
  return 28;
}

export default function CrosswordOnline({ data, onComplete }: CrosswordOnlineProps) {
  const size = data.width;
  const maxCell = getMaxCell(size);
  const { ref, cellPx } = useResponsiveCell(size, maxCell, 2);

  const [playerGrid, setPlayerGrid] = useState<string[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill("")),
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [currentDirection, setCurrentDirection] = useState<"across" | "down">("across");
  const completedRef = useRef(false);

  const isComplete = useMemo(() => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data.blocks[r][c]) continue;
        if (playerGrid[r][c] !== data.grid[r][c]) return false;
      }
    }
    return true;
  }, [playerGrid, data.grid, data.blocks, size]);

  if (isComplete && !completedRef.current) {
    completedRef.current = true;
    setTimeout(() => onComplete?.(), 500);
  }

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (data.blocks[r][c]) return;
      if (selectedCell && selectedCell[0] === r && selectedCell[1] === c) {
        setCurrentDirection((d) => (d === "across" ? "down" : "across"));
      } else {
        setSelectedCell([r, c]);
      }
    },
    [selectedCell, data.blocks],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        let nc = c + 1;
        while (nc < size && data.blocks[r][nc]) nc++;
        if (nc < size) setSelectedCell([r, nc]);
        setCurrentDirection("across");
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        let nc = c - 1;
        while (nc >= 0 && data.blocks[r][nc]) nc--;
        if (nc >= 0) setSelectedCell([r, nc]);
        setCurrentDirection("across");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        let nr = r + 1;
        while (nr < size && data.blocks[nr][c]) nr++;
        if (nr < size) setSelectedCell([nr, c]);
        setCurrentDirection("down");
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        let nr = r - 1;
        while (nr >= 0 && data.blocks[nr][c]) nr--;
        if (nr >= 0) setSelectedCell([nr, c]);
        setCurrentDirection("down");
        return;
      }

      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= "A" && key <= "Z") {
        e.preventDefault();
        setPlayerGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = key;
          return next;
        });

        if (currentDirection === "across") {
          let nc = c + 1;
          while (nc < size && data.blocks[r][nc]) nc++;
          if (nc < size) setSelectedCell([r, nc]);
        } else {
          let nr = r + 1;
          while (nr < size && data.blocks[nr][c]) nr++;
          if (nr < size) setSelectedCell([nr, c]);
        }
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setPlayerGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[r][c] !== "") {
            next[r][c] = "";
          } else {
            if (currentDirection === "across") {
              let nc = c - 1;
              while (nc >= 0 && data.blocks[r][nc]) nc--;
              if (nc >= 0) {
                next[r][nc] = "";
                setSelectedCell([r, nc]);
              }
            } else {
              let nr = r - 1;
              while (nr >= 0 && data.blocks[nr][c]) nr--;
              if (nr >= 0) {
                next[nr][c] = "";
                setSelectedCell([nr, c]);
              }
            }
          }
          return next;
        });
      }
    },
    [selectedCell, currentDirection, data.blocks, size],
  );

  const acrossClues = useMemo(
    () => data.clues.filter((c) => c.direction === "across"),
    [data.clues],
  );
  const downClues = useMemo(
    () => data.clues.filter((c) => c.direction === "down"),
    [data.clues],
  );

  function activeClueForCell(): CrosswordClue | null {
    if (!selectedCell) return null;
    const [r, c] = selectedCell;
    for (const clue of data.clues) {
      const { row, col, direction, word } = clue;
      if (direction === currentDirection) {
        if (direction === "across" && r === row && c >= col && c < col + word.length) {
          return clue;
        }
        if (direction === "down" && c === col && r >= row && r < row + word.length) {
          return clue;
        }
      }
    }
    for (const clue of data.clues) {
      const { row, col, direction, word } = clue;
      if (direction === "across" && r === row && c >= col && c < col + word.length) {
        return clue;
      }
      if (direction === "down" && c === col && r >= row && r < row + word.length) {
        return clue;
      }
    }
    return null;
  }

  const activeClue = activeClueForCell();

  return (
    <div className="flex flex-col items-center gap-6 w-full" onKeyDown={handleKeyDown}>
      <div className="glass-card px-5 py-4 w-full max-w-md">
        <p className="mb-1 font-medium text-primary">Instrucciones:</p>
        <ol className="list-inside list-decimal space-y-1 text-muted text-sm">
          <li>Haz clic en una celda para seleccionarla. Vuelve a hacer clic para cambiar direccion.</li>
          <li>Escribe la letra correcta usando el teclado.</li>
          <li>Usa las flechas del teclado para navegar entre celdas.</li>
          <li>Presiona Backspace para borrar o retroceder.</li>
        </ol>
      </div>

      {activeClue && (
        <div className="glass-card px-4 py-2 w-full max-w-md text-center">
          <p className="text-sm font-medium text-primary">
            {activeClue.number}. {activeClue.clue}
          </p>
          <p className="text-xs text-muted">
            {activeClue.direction === "across" ? "Horizontal" : "Vertical"} — {activeClue.word.length} letras
          </p>
        </div>
      )}

      <div
        ref={ref}
        tabIndex={0}
        className="glass-card !p-2 w-full sm:w-fit overflow-hidden outline-none"
        style={{ margin: "0 auto" }}
      >
        <div
          className="grid gap-px select-none touch-none"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {Array.from({ length: size }, (_, r) =>
            Array.from({ length: size }, (_, c) => {
              const isBlock = data.blocks[r][c];
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const letter = playerGrid[r][c] || "";
              const num = data.numbers[r][c];

              return (
                <div
                  key={`${r},${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    backgroundColor: isBlock
                      ? "#111827"
                      : isSelected
                        ? "rgba(99,102,241,0.4)"
                        : "var(--card-bg)",
                    cursor: isBlock ? "default" : "pointer",
                  }}
                  className="flex items-center justify-center relative"
                >
                  {!isBlock && (
                    <span
                      className="font-bold select-none"
                      style={{
                        fontSize: cellPx * 0.45,
                        color: letter ? "var(--accent)" : "transparent",
                      }}
                    >
                      {letter || "·"}
                    </span>
                  )}
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
                    <span className="text-xs text-muted"> ({clue.word.length})</span>
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
                    <span className="text-xs text-muted"> ({clue.word.length})</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {isComplete && (
        <div className="glass-card p-4 text-center w-full max-w-md">
          <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
            Crucigrama completado!
          </p>
        </div>
      )}
    </div>
  );
}
