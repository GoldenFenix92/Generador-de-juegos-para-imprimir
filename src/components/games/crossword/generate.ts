import type { CrosswordConfig, CrosswordOutput, CrosswordPlacedWord, CrosswordClue } from "./types";
import { WORD_BANK } from "../../../data/wordbank";

const DIFFICULTY_CONFIG = {
  easy: { gridSize: 7, minWordLen: 4, targetWords: 5 },
  medium: { gridSize: 9, minWordLen: 4, targetWords: 7 },
  hard: { gridSize: 11, minWordLen: 5, targetWords: 9 },
  expert: { gridSize: 13, minWordLen: 5, targetWords: 11 },
} as const;

const CLUE_MAP: Record<string, string> = {
  AGUA: "Liquido vital",
  SOL: "Estrella del sistema solar",
  LUNA: "Satelite natural",
  MAR: "Gran masa de agua salada",
  TIERRA: "Planeta donde vivimos",
  FUEGO: "Produce calor y luz",
  AIRE: "Lo respiramos",
  ARBOL: "Tiene hojas y raices",
  FLOR: "Parte colorida de una planta",
  PERRO: "Mejor amigo del hombre",
  GATO: "Animal que caza ratones",
  PEZ: "Vive en el agua",
  PAJARO: "Tiene alas y vuela",
  CABALLO: "Animal que se monta",
  VACA: "Da leche",
  OVEJA: "Da lana",
  CERDO: "Animal de granja",
  RATON: "Animal pequeno que roe",
  LOBO: "Aulla a la luna",
  OSO: "Animal grande y peludo",
  LEON: "Rey de la selva",
  TIGRE: "Felino rayado",
  ELEFANTE: "Animal con trompa",
  JIRAFA: "Animal de cuello largo",
  MANZANA: "Fruta roja o verde",
  BANANA: "Fruta amarilla y alargada",
  PAN: "Alimento hecho con harina",
  LECHE: "Bebida blanca nutritiva",
  QUESO: "Alimento hecho de leche",
  ARROZ: "Cereal blanco muy usado",
  PASTA: "Comida italiana",
  SOPA: "Comida liquida caliente",
  ENSALADA: "Mezcla de verduras",
  CARNE: "Alimento de origen animal",
  POLLO: "Ave que se come",
  PESCADO: "Carne del mar",
  BEBIDA: "Bebida sin color",
  CAFE: "Bebida caliente y amarga",
  TE: "Infusion de hojas",
  JUGO: "Bebida de frutas",
  CERVEZA: "Bebida alcoholica de cebada",
  VINO: "Bebida de uvas fermentadas",
  FUTBOL: "Deporte con pelota y arcos",
  BASQUET: "Deporte de canasta",
  TENIS: "Deporte con raqueta",
  NATACION: "Deporte en el agua",
  CICLISMO: "Deporte con bicicleta",
  CORRER: "Actividad de mover las piernas rapido",
  SALTAR: "Impulsarse del suelo",
  NADAR: "Moverse en el agua",
  DOCTOR: "Cuida la salud de las personas",
  BOMBERO: "Apaga incendios",
  POLICIA: "Protege a la ciudadania",
  MAESTRO: "Ensenia en la escuela",
  ABOGADO: "Defiende en los juicios",
  INGENIERO: "Disena y construye",
  MUSICA: "Arte de los sonidos",
  GUITARRA: "Instrumento de cuerdas",
  PIANO: "Instrumento de teclas",
  VIOLIN: "Instrumento de arco",
  BATERIA: "Instrumento de percusion",
  FLAUTA: "Instrumento de viento",
  CANCION: "Composicion musical con letra",
  VIAJE: "Recorrido a otro lugar",
  MAPA: "Representacion de un lugar",
  AVION: "Medio de transporte aereo",
  TREN: "Medio de transporte sobre rieles",
  BARCO: "Transporte por agua",
  HOTEL: "Lugar donde alojarse",
  PLAYA: "Lugar con arena y mar",
  MONTANA: "Elevacion natural del terreno",
  CIUDAD: "Lugar con muchos habitantes",
  CASA: "Vivienda de las personas",
  COCINA: "Lugar donde se prepara comida",
  SALA: "Habitacion principal de la casa",
  DORMITORIO: "Habitacion para dormir",
  BANO: "Habitacion con inodoro y ducha",
  VENTANA: "Abertura en la pared",
  PUERTA: "Entrada a un lugar",
  MESA: "Mueble con superficie plana",
  SILLA: "Mueble para sentarse",
  CAMISA: "Prenda de vestir con botones",
  PANTALON: "Prenda que cubre las piernas",
  VESTIDO: "Prenda femenina de una pieza",
  ZAPATO: "Calzado para el pie",
  SOMBRERO: "Prenda para la cabeza",
  BUFANDA: "Prenda para el cuello",
  GAFAS: "Se usan para ver mejor",
  RELOJ: "Sirve para ver la hora",
  LIBRO: "Conjunto de hojas escritas",
  LAPIZ: "Se usa para escribir",
  HOJA: "Parte verde de una planta o papel",
  ROJO: "Color como la sangre",
  AZUL: "Color del cielo",
  VERDE: "Color de la naturaleza",
  AMARILLO: "Color del sol",
  NEGRO: "Color oscuro",
  BLANCO: "Color claro",
  GRIS: "Color entre blanco y negro",
  AMOR: "Sentimiento profundo",
  PAZ: "Estado de tranquilidad",
  ALEGRIA: "Sentimiento de felicidad",
  BONDAD: "Cualidad de ser bueno",
  HONESTIDAD: "Cualidad de decir la verdad",
  RESPETO: "Consideracion hacia otros",
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWordsForCrossword(config: CrosswordConfig): { word: string; clue: string }[] {
  const diff = DIFFICULTY_CONFIG[config.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const minLen = diff.minWordLen;
  const target = diff.targetWords;

  let candidates: string[] = [];

  if (config.generationMode === "themed" && config.theme) {
    candidates = WORD_BANK[config.theme] ?? WORD_BANK.general;
  } else if (config.generationMode === "custom" && config.customWords?.length) {
    candidates = config.customWords;
  } else {
    candidates = Object.values(WORD_BANK).flat();
  }

  const filtered = candidates.filter((w) => w.length >= minLen && w.length <= gridSizeForDifficulty(config.difficulty) - 2);
  const unique = [...new Set(filtered.map((w) => w.toUpperCase()))];
  const shuffled = shuffleArray(unique);

  const result: { word: string; clue: string }[] = [];
  for (const w of shuffled) {
    if (result.length >= target) break;
    if (result.some((r) => r.word === w)) continue;
    const clue = CLUE_MAP[w] ?? `Palabra de ${w.length} letras`;
    result.push({ word: w, clue });
  }

  return result.sort((a, b) => b.word.length - a.word.length);
}

function gridSizeForDifficulty(difficulty: string): number {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.gridSize ?? 9;
}

function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down",
): boolean {
  const size = grid.length;
  const len = word.length;

  if (direction === "across") {
    if (col < 0 || col + len > size) return false;
    if (row < 0 || row >= size) return false;

    for (let i = 0; i < len; i++) {
      const cell = grid[row][col + i];
      if (cell !== "" && cell !== word[i]) return false;
    }

    const leftOk = col === 0 || grid[row][col - 1] === "";
    const rightOk = col + len >= size || grid[row][col + len] === "";
    if (!leftOk || !rightOk) return false;

    for (let i = 0; i < len; i++) {
      const isEmpty = grid[row][col + i] === "";
      if (isEmpty) {
        const aboveOk = row === 0 || grid[row - 1][col + i] === "";
        const belowOk = row === size - 1 || grid[row + 1][col + i] === "";
        if (!aboveOk || !belowOk) return false;
      }
    }

    return true;
  } else {
    if (row < 0 || row + len > size) return false;
    if (col < 0 || col >= size) return false;

    for (let i = 0; i < len; i++) {
      const cell = grid[row + i][col];
      if (cell !== "" && cell !== word[i]) return false;
    }

    const aboveOk = row === 0 || grid[row - 1][col] === "";
    const belowOk = row + len >= size || grid[row + len][col] === "";
    if (!aboveOk || !belowOk) return false;

    for (let i = 0; i < len; i++) {
      const isEmpty = grid[row + i][col] === "";
      if (isEmpty) {
        const leftOk = col === 0 || grid[row + i][col - 1] === "";
        const rightOk = col === size - 1 || grid[row + i][col + 1] === "";
        if (!leftOk || !rightOk) return false;
      }
    }

    return true;
  }
}

function placeWord(grid: string[][], word: string, row: number, col: number, direction: "across" | "down"): void {
  for (let i = 0; i < word.length; i++) {
    if (direction === "across") {
      grid[row][col + i] = word[i];
    } else {
      grid[row + i][col] = word[i];
    }
  }
}

function findBestPlacement(
  grid: string[][],
  word: string,
  placedWords: CrosswordPlacedWord[],
  size: number,
): { row: number; col: number; direction: "across" | "down"; score: number } | null {
  let best: { row: number; col: number; direction: "across" | "down"; score: number } | null = null;

  for (const placed of placedWords) {
    for (let pi = 0; pi < placed.word.length; pi++) {
      for (let wi = 0; wi < word.length; wi++) {
        if (placed.word[pi] !== word[wi]) continue;

        let row: number, col: number;
        const direction: "across" | "down" = placed.direction === "across" ? "down" : "across";

        if (placed.direction === "across") {
          row = placed.row - wi;
          col = placed.col + pi;
        } else {
          row = placed.row + pi;
          col = placed.col - wi;
        }

        if (!canPlace(grid, word, row, col, direction)) continue;

        const center = (size - 1) / 2;
        const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
        const score = wi * 10 - distFromCenter + Math.random();

        if (!best || score > best.score) {
          best = { row, col, direction, score };
        }
      }
    }
  }

  if (!best && gridSizeForDifficulty("easy") >= word.length) {
    const center = Math.floor(size / 2);
    const startCol = Math.floor((size - word.length) / 2);

    if (placedWords.length === 0) {
      if (canPlace(grid, word, center, startCol, "across")) {
        return { row: center, col: startCol, direction: "across", score: 999 };
      }
    }
  }

  return best;
}

function numberCells(
  grid: string[][],
  placedWords: CrosswordPlacedWord[],
): (number | null)[][] {
  const size = grid.length;
  const numbers: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  let num = 1;
  const starts = new Set<string>();

  for (const pw of placedWords) {
    const key = `${pw.row},${pw.col}`;
    if (!starts.has(key)) {
      starts.add(key);
      numbers[pw.row][pw.col] = num;
      num++;
    }
  }

  return numbers;
}

function generateClues(
  placedWords: CrosswordPlacedWord[],
  wordClueMap: Map<string, string>,
): CrosswordClue[] {
  const clues: CrosswordClue[] = [];
  let num = 1;
  const seen = new Set<string>();

  for (const pw of placedWords) {
    const key = `${pw.row},${pw.col}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let clueText = wordClueMap.get(pw.word);
    if (!clueText) {
      clueText = `${pw.direction === "across" ? "Horizontal" : "Vertical"} - ${pw.word.length} letras`;
    }

    clues.push({
      number: num,
      direction: pw.direction,
      word: pw.word,
      clue: clueText,
      row: pw.row,
      col: pw.col,
    });

    num++;
  }

  return clues;
}

function createBlocks(grid: string[][]): boolean[][] {
  const size = grid.length;
  const blocks: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(grid[r][c] === "");
    }
    blocks.push(row);
  }
  return blocks;
}

export function generateCrossword(config: CrosswordConfig): CrosswordOutput {
  const diff = DIFFICULTY_CONFIG[config.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const size = diff.gridSize;
  const grid = createEmptyGrid(size);
  const wordEntries = getWordsForCrossword(config);
  const clueMap = new Map(wordEntries.map((e) => [e.word, e.clue]));

  const placedWords: CrosswordPlacedWord[] = [];

  for (let i = 0; i < wordEntries.length; i++) {
    const { word } = wordEntries[i];

    if (i === 0) {
      const center = Math.floor(size / 2);
      const startCol = Math.max(0, Math.floor((size - word.length) / 2));
      if (canPlace(grid, word, center, startCol, "across")) {
        placeWord(grid, word, center, startCol, "across");
        placedWords.push({ word, row: center, col: startCol, direction: "across" });
      }
      continue;
    }

    const best = findBestPlacement(grid, word, placedWords, size);
    if (best) {
      placeWord(grid, word, best.row, best.col, best.direction);
      placedWords.push({ word, row: best.row, col: best.col, direction: best.direction });
    }
  }

  const blocks = createBlocks(grid);
  const numbers = numberCells(grid, placedWords);
  const clues = generateClues(placedWords, clueMap);

  return {
    grid,
    blocks,
    width: size,
    height: size,
    placedWords,
    numbers,
    clues,
  };
}
