export type CrosswordMode = "online" | "print";
export type GenerationMode = "random" | "themed" | "custom";
export type ThemeId = string;

export const CROSSWORD_THEMES = [
  { id: "general", label: "General" },
  { id: "naturaleza", label: "Naturaleza" },
  { id: "animales", label: "Animales" },
  { id: "comida", label: "Comida" },
  { id: "deportes", label: "Deportes" },
  { id: "profesiones", label: "Profesiones" },
  { id: "musica", label: "Musica" },
  { id: "viajes", label: "Viajes" },
  { id: "casa", label: "Casa" },
  { id: "ropa", label: "Ropa" },
  { id: "colores", label: "Colores" },
  { id: "valores", label: "Valores" },
  { id: "autos", label: "Autos" },
] as const;

export interface CrosswordConfig {
  size: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  wordCount: number;
  mode?: CrosswordMode;
  generationMode: GenerationMode;
  theme?: ThemeId;
  customWords?: string[];
  sheetCount?: number;
  showSolution?: boolean;
  showSolutionInPDF?: boolean;
}

export interface CrosswordPlacedWord {
  word: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

export interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  word: string;
  clue: string;
  row: number;
  col: number;
}

export interface CrosswordOutput {
  grid: string[][];
  blocks: boolean[][];
  width: number;
  height: number;
  placedWords: CrosswordPlacedWord[];
  numbers: (number | null)[][];
  clues: CrosswordClue[];
}
