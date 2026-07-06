import { shuffle, createGrid } from "../../../lib/algorithms";
import type { WordSearchConfig, WordSearchOutput } from "./types";
import { THEME_POOLS } from "./themes";

const WORD_POOLS: Record<string, string[]> = {
  easy: [
    "SOL", "LUNA", "MAR", "CIELO", "ROJO", "AZUL", "VERDE", "CASA", "PERRO", "GATO",
    "RANA", "SAPO", "CRUZ", "LUZ", "FLOR", "GRIS", "ORO", "VELA", "NUBE", "RIO",
    "PIE", "MANO", "SOL", "TREN", "CALLE", "VINO", "SEDA", "CAMA", "MESA", "RAMA",
    "PINO", "ROSA", "LAGO", "RATO", "PATO", "MONO", "OSO", "VACA", "LOBO", "PEZ",
  ],
  medium: [
    "PLAYA", "MONTAÑA", "BOSQUE", "CAMINO", "PUENTE", "JARDIN", "FUENTE", "VALLE",
    "LAGUNA", "CASCADA", "SENDERO", "CAMPO", "RANCHO", "HUERTO", "ESTRELLA",
    "VIENTO", "TORRE", "FUEGO", "AGUILA", "Delfin", "ISLA", "TEMPLO", "CASTILLO",
    "JUNGLA", "DESIERTO", "CUEVA", "RIBERA", "PRADO", "GLACIAR", "VOLCAN",
  ],
  hard: [
    "COMPUTADORA", "PROGRAMACION", "ALGORITMO", "TECLADO", "PANTALLA",
    "VENTANA", "DOCUMENTO", "LIBRERIA", "TECNOLOGIA", "HARDWARE",
    "SOFTWARE", "PROCESADOR", "MEMORIA", "BASE_DATOS", "SERVIDOR",
    "LENGUAJE", "COMPILADOR", "SISTEMA", "APLICACION", "ARCHIVO",
    "COMANDO", "TERMINAL", "INTERFAZ", "MODULO", "FUNCION",
  ],
  expert: [
    "HIPOTENUSA", "TRIGONOMETRIA", "DERIVADA", "INTEGRAL", "LOGARITMO",
    "ECUACION", "POLINOMIO", "GEOMETRIA", "PROBABILIDAD", "ESTADISTICA",
    "CALCULO", "VECTOR", "MATRIZ", "FRACTAL", "TEOREMA",
    "AXIOMA", "DEMOSTRACION", "CONJUNTO", "GRAFICA", "SIMETRIA",
  ],
};

const DIRECTIONS: [number, number][] = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
];

const REVERSE_DIRECTIONS: [number, number][] = [
  [0, -1],  // left
  [-1, 0],  // up
  [-1, -1], // diagonal up-left
  [1, -1],  // diagonal down-left
  [-1, 1],  // diagonal up-right
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const endR = row + dr * (word.length - 1);
  const endC = col + dc * (word.length - 1);
  if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) return false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
) {
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

function fillEmpty(grid: string[][]) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === "") grid[r][c] = randomLetter();
    }
  }
}

function getGridSize(wordCount: number): number {
  if (wordCount <= 5) return 10;
  if (wordCount <= 10) return 14;
  if (wordCount <= 15) return 18;
  return 22;
}

function selectWords(config: WordSearchConfig): string[] {
  const count = config.wordCount ?? 10;

  if (config.generationMode === "themed" && config.theme && THEME_POOLS[config.theme]) {
    const pool = shuffle([...THEME_POOLS[config.theme]]);
    return pool.slice(0, Math.min(count, pool.length));
  }

  if (config.generationMode === "custom" && config.customWords && config.customWords.length > 0) {
    const valid = config.customWords
      .filter((w) => w.trim().length >= 2)
      .map((w) => w.trim().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ]/g, ""))
      .filter((w) => w.length >= 2);
    if (valid.length === 0) {
      return shuffle([...WORD_POOLS.medium]).slice(0, count);
    }
    return shuffle([...new Set(valid)]).slice(0, count);
  }

  const pool = shuffle([...WORD_POOLS[config.difficulty] ?? WORD_POOLS.medium]);
  return pool.slice(0, count);
}

export function generateWordSearch(config: WordSearchConfig): WordSearchOutput {
  const size = getGridSize(config.wordCount);
  const grid = createGrid(size, size, "");
  const selectedWords = selectWords(config);

  const allDirections =
    config.difficulty === "hard" || config.difficulty === "expert"
      ? [...DIRECTIONS, ...REVERSE_DIRECTIONS]
      : [...DIRECTIONS];

  const positions: WordSearchOutput["positions"] = [];

  for (const word of selectedWords) {
    const upperWord = word.toUpperCase().replace(/[^A-Z]/g, "");
    if (upperWord.length < 2) continue;
    const directions = shuffle([...allDirections]);
    let placed = false;

    for (const [dr, dc] of directions) {
      const maxRow = dr === 0 ? size - 1 : dr > 0 ? size - upperWord.length : size - 1;
      const maxCol = dc === 0 ? size - 1 : dc > 0 ? size - upperWord.length : size - 1;
      const minRow = dr >= 0 ? 0 : upperWord.length - 1;
      const minCol = dc >= 0 ? 0 : upperWord.length - 1;

      const candidates: [number, number][] = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (canPlace(grid, upperWord, r, c, dr, dc)) {
            candidates.push([r, c]);
          }
        }
      }

      if (candidates.length > 0) {
        const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
        placeWord(grid, upperWord, r, c, dr, dc);
        positions.push({ word: upperWord, row: r, col: c, direction: [dr, dc] });
        placed = true;
        break;
      }
    }

    if (!placed) {
      for (let attempt = 0; attempt < 200; attempt++) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
        if (canPlace(grid, upperWord, r, c, dr, dc)) {
          placeWord(grid, upperWord, r, c, dr, dc);
          positions.push({ word: upperWord, row: r, col: c, direction: [dr, dc] });
          placed = true;
          break;
        }
      }
    }
  }

  fillEmpty(grid);

  return {
    grid,
    words: selectedWords.map((w) => w.toUpperCase().replace(/[^A-Z]/g, "")),
    positions,
  };
}
