export interface MazeConfig {
  size: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface MazeOutput {
  width: number;
  height: number;
  walls: boolean[][];
  start: [number, number];
  end: [number, number];
  solution: [number, number][];
}
