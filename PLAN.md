# Generador de Juegos Imprimibles — Plan de Proyecto

## Stack

```
React 19 + TypeScript + Vite
@react-pdf/renderer   → PDF vectorial de alta calidad
Tailwind CSS v4       → UI rápida
React Router DOM      → Navegación
Zustand               → Estado global (configs, historial)
Vitest + RTL          → Testing
ESLint + Prettier     → Calidad
```

## Juegos propuestos (MVP)

| Juego            | Algoritmo clave                      | Componentes                       |
| ---------------- | ------------------------------------ | --------------------------------- |
| **Sopa de letras** | Colocación aleatoria de palabras + relleno | `WordSearch`, `WordSearchPDF` |
| **Sudoku**       | Backtracking para generar + resolver | `Sudoku`, `SudokuPDF`             |
| **Laberinto**    | DFS / Recursive backtracker          | `Maze`, `MazePDF`                 |
| **Tres en raya** | Plantilla de tablero                 | `TicTacToe`, `TicTacToePDF`       |

## Arquitectura de carpetas

```
src/
├── components/
│   ├── layout/           # Header, Footer, PrintLayout
│   ├── games/
│   │   ├── wordsearch/   # WordSearch.tsx, WordSearchPDF.tsx, generate.ts, types.ts
│   │   ├── sudoku/
│   │   ├── maze/
│   │   └── tictactoe/
│   ├── pdf/              # PDFDocument.tsx (layout común), downloadPDF.ts
│   └── ui/               # Button, Input, Select, DifficultySelector
├── pages/                # Home, Generator, PrintPreview
├── lib/
│   ├── algorithms/       # shuffle.ts, grid.ts, backtracking.ts
│   └── print.ts
└── types/games.ts
```

## Flujo de usuario

```
Home → Seleccionar juego → Configurar params (tamaño, dificultad)
     → Vista previa en React → [Imprimir] o [Descargar PDF]
```

## Generación de PDF

Dos estrategias complementarias:

1. **@react-pdf/renderer** — Para juegos con contenido estructurado (sudoku, sopa de letras). Genera PDF vectorial que se escala perfecto.

2. **window.print() + CSS @media print** — Alternativa sin dependencias. El usuario imprime directamente desde el navegador. Ideal para juegos visuales (laberintos, tres en raya).

Cada juego tendrá:
- Un componente `*Game*.tsx` (vista previa en React)
- Un componente `*Game*PDF.tsx` (documento @react-pdf)
- Una función pura `generate*()` (algoritmo, 100% testeable sin React)

## Habilidades necesarias

- **React + TypeScript + Tailwind** — Base
- **@react-pdf/renderer** — API similar a React Native (`Document`, `Page`, `View`, `Text`, `Rect`, `Line`, `Svg`)
- **Algoritmos** — DFS para laberintos, backtracking para sudoku, greedy para sopa de letras
- **Patrón Strategy** — Cada juego implementa interfaz común `GameDefinition { generate, preview, toPDF }`

## Próximos pasos

1. Inicializar proyecto con Vite + React + TS
2. Implementar juego por juego empezando por Sopa de letras
3. Integrar PDF con @react-pdf/renderer
4. Agregar testing con Vitest
5. Deploy (opcional: Vercel / GitHub Pages)
