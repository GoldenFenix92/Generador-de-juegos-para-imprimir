# game-definition

Patrón Strategy para definir juegos imprimibles. Cada juego implementa una interfaz común.

## Interfaz `GameDefinition`

```ts
interface GameDefinition<TOutput, TConfig extends GameConfig> {
  generate(config: TConfig): TOutput;
  Preview: React.FC<{ data: TOutput; config: TConfig }>;
  PDFDocument: React.FC<{ data: TOutput; config: TConfig }>;
  defaultConfig: TConfig;
}
```

## Estructura de carpetas por juego

```
src/components/games/{game}/
├── types.ts       → Interfaces de config y output
├── generate.ts    → Algoritmo puro (100% testeable sin React)
├── *Game*.tsx     → Preview en React + re-export de generate/types
├── *Game*PDF.tsx  → Componente @react-pdf
└── index.ts       → Ensambla GameDefinition y exporta
```

## Reglas del patrón

1. **`generate()` debe ser pura** — sin efectos secundarios, sin React, solo recibe config y devuelve data
2. **Preview y PDFDocument reciben `data` y `config`** — misma salida de `generate()`
3. **`defaultConfig`** — valores iniciales para el generador
4. **Registry central** — todos los juegos se registran en `gameRegistry.ts`

## Cómo agregar un juego nuevo

1. Crear carpeta `src/components/games/{nombre}/`
2. Definir `types.ts` con `{Nombre}Config` y `{Nombre}Output`
3. Implementar `generate()` en `generate.ts`
4. Crear `{Nombre}.tsx` con preview React + re-exports
5. Crear `{Nombre}PDF.tsx` con componente @react-pdf
6. Crear `index.ts` ensamblando `GameDefinition`
7. Importar y registrar en `gameRegistry.ts`
8. Agregar label en los mapeos de las páginas
