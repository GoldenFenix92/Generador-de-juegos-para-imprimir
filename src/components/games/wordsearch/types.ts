import type { Difficulty } from "../../../types/games";

export type WordSearchMode = "online" | "print";
export type GenerationMode = "random" | "themed" | "custom";

export const THEMES = [
  { id: "naturaleza", label: "Naturaleza" },
  { id: "autos", label: "Autos" },
  { id: "valores", label: "Valores" },
  { id: "animales", label: "Animales" },
  { id: "colores", label: "Colores" },
  { id: "comida", label: "Comida" },
  { id: "deportes", label: "Deportes" },
  { id: "profesiones", label: "Profesiones" },
  { id: "musica", label: "Música" },
  { id: "viajes", label: "Viajes" },
  { id: "casa", label: "Casa" },
  { id: "ropa", label: "Ropa" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export interface WordSearchConfig {
  size: number;
  difficulty: Difficulty;
  wordCount: 5 | 10 | 15 | 20;
  mode: WordSearchMode;
  showSolution?: boolean;
  generationMode: GenerationMode;
  theme?: ThemeId;
  customWords?: string[];
}

export interface WordSearchOutput {
  grid: string[][];
  words: string[];
  positions: { word: string; row: number; col: number; direction: [number, number] }[];
}
