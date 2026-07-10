import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useResponsiveCell } from "../../../lib/useResponsiveCell";
import { Button } from "../../ui/Button";
import type { MazeConfig, MazeOutput } from "./types";

interface MazeOnlineProps {
  data: MazeOutput;
  config: MazeConfig;
  onComplete?: () => void;
}

function getMaxCell(wallCols: number): number {
  if (wallCols <= 11) return 48;
  if (wallCols <= 17) return 36;
  if (wallCols <= 25) return 28;
  return 22;
}

function canStep(
  walls: boolean[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
): boolean {
  const dr = Math.abs(toR - fromR);
  const dc = Math.abs(toC - fromC);
  if (dr + dc !== 1) return false;
  return !walls[toR][toC];
}

export default function MazeOnline({ data, onComplete }: MazeOnlineProps) {
  const { walls, start, end } = data;
  const wallCols = walls[0].length;
  const maxCell = getMaxCell(wallCols);
  const { ref, cellPx } = useResponsiveCell(wallCols, maxCell, 1);

  const startWall = useMemo<[number, number]>(
    () => [start[0] * 2 + 1, start[1] * 2 + 1],
    [start],
  );
  const endWall = useMemo<[number, number]>(
    () => [end[0] * 2 + 1, end[1] * 2 + 1],
    [end],
  );

  const [path, setPath] = useState<[number, number][]>([startWall]);
  const completedRef = useRef(false);

  const pathSet = useMemo(() => {
    const set = new Set<string>();
    for (const [r, c] of path) set.add(`${r},${c}`);
    return set;
  }, [path]);

  const isComplete = path[path.length - 1][0] === endWall[0] && path[path.length - 1][1] === endWall[1];

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  const resetPath = useCallback(() => {
    setPath([startWall]);
    completedRef.current = false;
  }, [startWall]);

  const processCell = useCallback(
    (r: number, c: number) => {
      if (walls[r][c]) return;
      const key = `${r},${c}`;
      if (pathSet.has(key)) {
        if (path.length >= 2) {
          const prevIdx = path.length - 2;
          if (path[prevIdx][0] === r && path[prevIdx][1] === c) {
            setPath((prev) => prev.slice(0, -1));
          }
        }
        return;
      }
      const last = path[path.length - 1];
      if (canStep(walls, last[0], last[1], r, c)) {
        setPath((prev) => [...prev, [r, c]]);
      }
    },
    [walls, pathSet, path],
  );

  const handleCellClick = useCallback(
    (r: number, c: number) => processCell(r, c),
    [processCell],
  );

  const touchLastRef = useRef<string | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
      if (!el) return;
      const key = el.dataset.cell;
      if (!key) return;
      touchLastRef.current = key;
      const [r, c] = key.split(",").map(Number);
      processCell(r, c);
    },
    [processCell],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
      if (!el) return;
      const key = el.dataset.cell;
      if (!key || key === touchLastRef.current) return;
      touchLastRef.current = key;
      const [r, c] = key.split(",").map(Number);
      processCell(r, c);
    },
    [processCell],
  );

  const handleTouchEnd = useCallback(() => {
    touchLastRef.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener("touchend", handleTouchEnd);
    return () => document.removeEventListener("touchend", handleTouchEnd);
  }, [handleTouchEnd]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const last = path[path.length - 1];
      let dr = 0;
      let dc = 0;
      if (e.key === "ArrowUp") dr = -1;
      else if (e.key === "ArrowDown") dr = 1;
      else if (e.key === "ArrowLeft") dc = -1;
      else if (e.key === "ArrowRight") dc = 1;
      else return;

      e.preventDefault();
      const nr = last[0] + dr;
      const nc = last[1] + dc;
      if (nr < 0 || nr >= walls.length || nc < 0 || nc >= wallCols) return;
      if (walls[nr][nc]) return;
      if (pathSet.has(`${nr},${nc}`)) return;
      if (canStep(walls, last[0], last[1], nr, nc)) {
        setPath((prev) => [...prev, [nr, nc]]);
      }
    },
    [path, pathSet, walls, wallCols],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="glass-card px-5 py-4 w-full max-w-md">
        <p className="mb-1 font-medium text-primary">Instrucciones:</p>
        <ol className="list-inside list-decimal space-y-1 text-muted text-sm">
          <li>Haz clic en una casilla abierta adyacente (sin muro) para extender el camino desde donde estas.</li>
          <li>Haz clic en la ultima casilla de tu camino para retroceder un paso.</li>
          <li>Llega a la meta (rojo) para completar el laberinto.</li>
        </ol>
      </div>

      <div
        ref={ref}
        className="glass-card !p-2 w-full sm:w-fit overflow-hidden"
        style={{ margin: "0 auto" }}
      >
        <div
          className="grid gap-px select-none touch-none"
          onTouchMove={handleTouchMove}
          style={{
            gridTemplateColumns: `repeat(${wallCols}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {walls.map((row, r) =>
            row.map((isWall, c) => {
              const key = `${r},${c}`;
              const isStart = r === startWall[0] && c === startWall[1];
              const isEnd = r === endWall[0] && c === endWall[1];
              const inPath = pathSet.has(key);
              const isOpen = !isWall;

              return (
                <div
                  key={key}
                  data-cell={key}
                  onClick={() => isOpen && handleCellClick(r, c)}
                  onTouchStart={isOpen ? handleTouchStart : undefined}
                  style={{ width: cellPx, height: cellPx, cursor: isOpen ? "pointer" : "default" }}
                  className={
                    isStart
                      ? "bg-green-500"
                      : isEnd
                        ? inPath
                          ? "bg-blue-400"
                          : "bg-red-500"
                        : inPath
                          ? "bg-blue-400"
                          : isWall
                            ? "bg-gray-900"
                            : "bg-white hover:bg-blue-100"
                  }
                />
              );
            }),
          )}
        </div>
      </div>

      {isComplete && (
        <div className="glass-card p-4 text-center w-full max-w-md">
          <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
            Laberinto completado!
          </p>
        </div>
      )}

      <Button
        variant="danger"
        className="w-full sm:w-auto"
        slideIcon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        onClick={resetPath}
      >
        Limpiar camino
      </Button>
    </div>
  );
}
