import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useResponsiveCell } from "../../../lib/useResponsiveCell";
import { Button } from "../../ui/Button";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

interface TicTacToeOnlineProps {
  data: TicTacToeOutput;
  config: TicTacToeConfig;
  onComplete?: () => void;
}

type Player = "X" | "O";
type Cell = Player | null;
type GameMode = "pvp" | "ai";

function getMaxCell(gridSize: number): number {
  if (gridSize <= 3) return 100;
  return 80;
}

function checkWin(grid: Cell[][], winLength: number): { winner: Player | null; line: [number, number][] } {
  const size = grid.length;

  function lineWin(cells: [number, number][]): Player | null {
    const first = grid[cells[0][0]][cells[0][1]];
    if (!first) return null;
    for (let i = 1; i < cells.length; i++) {
      if (grid[cells[i][0]][cells[i][1]] !== first) return null;
    }
    return first;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < winLength; i++) cells.push([r, c + i]);
      const w = lineWin(cells);
      if (w) return { winner: w, line: cells };
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < winLength; i++) cells.push([r + i, c]);
      const w = lineWin(cells);
      if (w) return { winner: w, line: cells };
    }
  }

  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < winLength; i++) cells.push([r + i, c + i]);
      const w = lineWin(cells);
      if (w) return { winner: w, line: cells };
    }
  }

  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < winLength; i++) cells.push([r + i, c - i]);
      const w = lineWin(cells);
      if (w) return { winner: w, line: cells };
    }
  }

  return { winner: null, line: [] };
}

function isBoardFull(grid: Cell[][]): boolean {
  return grid.every((row) => row.every((cell) => cell !== null));
}

function getEmptyCells(grid: Cell[][]): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (!grid[r][c]) cells.push([r, c]);
    }
  }
  return cells;
}

function aiRandom(grid: Cell[][]): [number, number] {
  const empty = getEmptyCells(grid);
  return empty[Math.floor(Math.random() * empty.length)];
}

function aiStrategic(grid: Cell[][], player: Player, winLength: number): [number, number] {
  const opponent: Player = player === "X" ? "O" : "X";
  const size = grid.length;

  function canWin(p: Player): [number, number] | null {
    for (const [r, c] of getEmptyCells(grid)) {
      const test = grid.map((row) => [...row]);
      test[r][c] = p;
      if (checkWin(test, winLength).winner === p) return [r, c];
    }
    return null;
  }

  const winMove = canWin(player);
  if (winMove) return winMove;

  const blockMove = canWin(opponent);
  if (blockMove) return blockMove;

  const center = Math.floor(size / 2);
  if (!grid[center][center]) return [center, center];

  const corners: [number, number][] = [[0, 0], [0, size - 1], [size - 1, 0], [size - 1, size - 1]];
  const shuffledCorners = corners.sort(() => Math.random() - 0.5);
  for (const [r, c] of shuffledCorners) {
    if (!grid[r][c]) return [r, c];
  }

  const empty = getEmptyCells(grid).sort(() => Math.random() - 0.5);
  return empty[0];
}

function aiMinimax(grid: Cell[][], player: Player, winLength: number): [number, number] {
  const opponent: Player = player === "X" ? "O" : "X";

  function minimax(
    board: Cell[][],
    isMaximizing: boolean,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    const result = checkWin(board, winLength);
    if (result.winner === player) return 10 - depth;
    if (result.winner === opponent) return depth - 10;
    if (isBoardFull(board)) return 0;

    const empty = getEmptyCells(board);
    if (isMaximizing) {
      let best = -Infinity;
      for (const [r, c] of empty) {
        board[r][c] = player;
        const score = minimax(board, false, depth + 1, alpha, beta);
        board[r][c] = null;
        best = Math.max(best, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const [r, c] of empty) {
        board[r][c] = opponent;
        const score = minimax(board, true, depth + 1, alpha, beta);
        board[r][c] = null;
        best = Math.min(best, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  const board = grid.map((row) => [...row]);
  let bestScore = -Infinity;
  let bestMove: [number, number] = [0, 0];

  for (const [r, c] of getEmptyCells(grid)) {
    board[r][c] = player;
    const score = minimax(board, false, 0, -Infinity, Infinity);
    board[r][c] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }

  return bestMove;
}

export default function TicTacToeOnline({ config, onComplete }: TicTacToeOnlineProps) {
  const gridSize = config.difficulty === "expert" ? 4 : 3;
  const winLength = gridSize === 4 ? 4 : 3;
  const maxCell = getMaxCell(gridSize);
  const { ref, cellPx } = useResponsiveCell(gridSize, maxCell, 4);

  const [board, setBoard] = useState<Cell[][]>(() =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null)),
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [winLine, setWinLine] = useState<[number, number][]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [gameOver, setGameOver] = useState(false);
  const aiThinkingRef = useRef(false);
  const completedRef = useRef(false);

  const isAiTurn = gameMode === "ai" && currentPlayer === "O" && !gameOver;

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (board[r][c] || gameOver || isAiTurn) return;
      if (gameMode === "ai" && currentPlayer !== "X") return;

      const next = board.map((row) => [...row]);
      next[r][c] = currentPlayer;
      setBoard(next);

      const result = checkWin(next, winLength);
      if (result.winner) {
        setWinner(result.winner);
        setWinLine(result.line);
        setGameOver(true);
        setScores((s) => ({ ...s, [result.winner!]: s[result.winner!] + 1 }));
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return;
      }

      if (isBoardFull(next)) {
        setWinner("draw");
        setGameOver(true);
        setScores((s) => ({ ...s, draw: s.draw + 1 }));
        return;
      }

      setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
    },
    [board, currentPlayer, gameMode, gameOver, isAiTurn, winLength, onComplete],
  );

  useEffect(() => {
    if (!isAiTurn || aiThinkingRef.current) return;
    aiThinkingRef.current = true;

    const timer = setTimeout(() => {
      setBoard((prev) => {
        const copy = prev.map((row) => [...row]);
        let move: [number, number];

        if (config.difficulty === "easy") {
          move = aiRandom(copy);
        } else if (config.difficulty === "medium") {
          move = aiStrategic(copy, "O", winLength);
        } else {
          move = aiMinimax(copy, "O", winLength);
        }

        copy[move[0]][move[1]] = "O";

        const result = checkWin(copy, winLength);
        if (result.winner) {
          setWinner(result.winner);
          setWinLine(result.line);
          setGameOver(true);
          setScores((s) => ({ ...s, O: s.O + 1 }));
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        } else if (isBoardFull(copy)) {
          setWinner("draw");
          setGameOver(true);
          setScores((s) => ({ ...s, draw: s.draw + 1 }));
        } else {
          setCurrentPlayer("X");
        }

        aiThinkingRef.current = false;
        return copy;
      });
    }, 400);

    return () => {
      clearTimeout(timer);
      aiThinkingRef.current = false;
    };
  }, [isAiTurn, config.difficulty, winLength, onComplete]);

  const resetGame = useCallback(() => {
    setBoard(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
    setCurrentPlayer("X");
    setWinner(null);
    setWinLine([]);
    setGameOver(false);
    aiThinkingRef.current = false;
  }, [gridSize]);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draw: 0 });
    resetGame();
  }, [resetGame]);

  const winLineSet = useMemo(() => {
    const set = new Set<string>();
    for (const [r, c] of winLine) set.add(`${r},${c}`);
    return set;
  }, [winLine]);

  const statusText = useMemo(() => {
    if (winner === "X") return "Ganaste!";
    if (winner === "O") return gameMode === "ai" ? "Gano la IA!" : "Gano O!";
    if (winner === "draw") return "Empate!";
    if (isAiTurn) return "Pensando...";
    return gameMode === "ai" ? "Tu turno (X)" : `Turno de ${currentPlayer}`;
  }, [winner, isAiTurn, gameMode, currentPlayer]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="glass-card px-5 py-4 w-full max-w-md">
        <p className="mb-1 font-medium text-primary">Instrucciones:</p>
        <ol className="list-inside list-decimal space-y-1 text-muted text-sm">
          {gameMode === "ai" ? (
            <>
              <li>Eres X, la IA es O. Haz clic en una casilla vacia para colocar tu marca.</li>
              <li>La IA respondera automaticamente despues de tu turno.</li>
              <li>El primero en alinear {winLength} en raya gana.</li>
            </>
          ) : (
            <>
              <li>Dos jugadores se turnan para colocar X y O en casillas vacias.</li>
              <li>El primero en alinear {winLength} en raya gana.</li>
              <li>Si no quedan mas casillas, es empate.</li>
            </>
          )}
        </ol>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setGameMode("ai"); resetGame(); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${gameMode === "ai" ? "bg-indigo-600 text-white" : "glass-card"}`}
        >
          vs IA
        </button>
        <button
          onClick={() => { setGameMode("pvp"); resetGame(); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${gameMode === "pvp" ? "bg-indigo-600 text-white" : "glass-card"}`}
        >
          2 Jugadores
        </button>
      </div>

      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {statusText}
        </p>
      </div>

      <div ref={ref} className="glass-card !p-2 w-full sm:w-fit overflow-hidden" style={{ margin: "0 auto" }}>
        <div
          className="grid gap-1 select-none touch-none"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
            justifyContent: "center",
            backgroundColor: "#9CA3AF",
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              const isWinCell = winLineSet.has(key);
              const isEmpty = !cell;

              return (
                <div
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    fontSize: cellPx * 0.5,
                    color: cell === "X" ? "var(--accent)" : cell === "O" ? "#EC4899" : "var(--text-primary)",
                    backgroundColor: isWinCell ? "rgba(45,212,191,0.3)" : "var(--card-bg)",
                    cursor: isEmpty && !gameOver && !isAiTurn ? "pointer" : "default",
                  }}
                  className="flex items-center justify-center font-bold select-none transition-colors hover:bg-white/20"
                >
                  {cell ?? ""}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="flex gap-6 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        <span>X: {scores.X}</span>
        <span>Emp: {scores.draw}</span>
        <span>O: {scores.O}</span>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="danger" className="w-full sm:w-auto" onClick={resetGame}
          slideIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        >
          Reiniciar
        </Button>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={resetScores}
          slideIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Reinicar scores
        </Button>
      </div>
    </div>
  );
}
