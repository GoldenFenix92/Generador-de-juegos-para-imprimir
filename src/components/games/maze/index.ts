import type { GameDefinition } from "../../../types/games";
import Maze, { generateMaze } from "./Maze";
import type { MazeConfig, MazeOutput } from "./types";

const mazeGame: GameDefinition<MazeOutput, MazeConfig> = {
  generate: generateMaze,
  Preview: Maze,
  defaultConfig: { size: 8, difficulty: "easy" },
};

export default mazeGame;
export type { MazeConfig, MazeOutput } from "./types";
