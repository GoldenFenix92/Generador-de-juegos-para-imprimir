export function createGrid<T>(rows: number, cols: number, fill: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

export function cloneGrid<T>(grid: T[][]): T[][] {
  return grid.map((row) => [...row]);
}
