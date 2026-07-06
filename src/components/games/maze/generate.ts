import type { MazeConfig, MazeOutput } from "./types";

// Grid is represented as cells; each cell has 4 walls: [top, right, bottom, left]
type CellWalls = [boolean, boolean, boolean, boolean];

function generateMazeDFS(rows: number, cols: number): CellWalls[][] {
  const grid: CellWalls[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [true, true, true, true] as CellWalls),
  );

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  const directions: [number, number, number, number][] = [
    [-1, 0, 0, 2], // up: remove top of current, bottom of neighbor
    [0, 1, 1, 3],  // right: remove right of current, left of neighbor
    [1, 0, 2, 0],  // down: remove bottom of current, top of neighbor
    [0, -1, 3, 1], // left: remove left of current, right of neighbor
  ];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors: [number, number, number, number][] = [];

    for (const [dr, dc, wallIdx, oppWallIdx] of directions) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        neighbors.push([nr, nc, wallIdx, oppWallIdx]);
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nr, nc, wallIdx, oppWallIdx] = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[cr][cc][wallIdx] = false;
      grid[nr][nc][oppWallIdx] = false;
      visited[nr][nc] = true;
      stack.push([nr, nc]);
    }
  }

  return grid;
}

function solveMazeBFS(
  grid: CellWalls[][],
  start: [number, number],
  end: [number, number],
): [number, number][] {
  const queue: [number, number][] = [start];
  const visited = new Set<string>();
  const parent = new Map<string, [number, number] | null>();
  const key = (r: number, c: number) => `${r},${c}`;

  visited.add(key(start[0], start[1]));
  parent.set(key(start[0], start[1]), null);

  const directions: [number, number, number][] = [
    [-1, 0, 0],
    [0, 1, 1],
    [1, 0, 2],
    [0, -1, 3],
  ];

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr === end[0] && cc === end[1]) break;

    for (const [dr, dc, wallIdx] of directions) {
      if (grid[cr][cc][wallIdx]) continue; // wall blocks
      const nr = cr + dr;
      const nc = cc + dc;
      const k = key(nr, nc);
      if (!visited.has(k)) {
        visited.add(k);
        parent.set(k, [cr, cc]);
        queue.push([nr, nc]);
      }
    }
  }

  // Reconstruct path
  const path: [number, number][] = [];
  let current: [number, number] | null = end;
  while (current) {
    path.unshift(current);
    current = parent.get(key(current[0], current[1])) ?? null;
  }

  return path;
}

export function generateMaze(config: MazeConfig): MazeOutput {
  const size = config.size;
  const grid = generateMazeDFS(size, size);

  const start: [number, number] = [0, 0];
  const end: [number, number] = [size - 1, size - 1];

  const solution = solveMazeBFS(grid, start, end);

  // Convert to wall array
  const wallRows = size * 2 + 1;
  const wallCols = size * 2 + 1;
  const walls: boolean[][] = Array.from({ length: wallRows }, () => Array(wallCols).fill(true));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const wr = r * 2 + 1;
      const wc = c * 2 + 1;
      walls[wr][wc] = false; // cell center is open

      if (!grid[r][c][0]) walls[wr - 1][wc] = false; // top
      if (!grid[r][c][1]) walls[wr][wc + 1] = false; // right
      if (!grid[r][c][2]) walls[wr + 1][wc] = false; // bottom
      if (!grid[r][c][3]) walls[wr][wc - 1] = false; // left
    }
  }

  return { width: wallCols, height: wallRows, walls, start, end, solution };
}
