# DEVELOPER.md — Documentacion tecnica

## Stack tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Framework | React | 19 |
| Lenguaje | TypeScript | 6 |
| Bundler | Vite | 8 |
| Estilos | Tailwind CSS | 4 |
| Routing | React Router | 7 |
| Estado | Zustand | 5 |
| PDF | @react-pdf/renderer | 4 |
| Tests | Vitest + Testing Library | 4 / 16 |
| Linter | ESLint (flat config) | 10 |
| Formateo | Prettier | 3 |

---

## Arquitectura del proyecto

```
src/
  components/
    games/           # Juegos (cada uno con su carpeta)
    layout/          # Layout principal, navbar, theme toggle, blobs
    pdf/             # Componente base PDF (envoltura @react-pdf)
    ui/              # Componentes de interfaz reutilizables
      Button.tsx     # Boton con 3 variantes + slideIcon
      Select.tsx     # Select con estilo glass
      DifficultySelector.tsx  # Selector de dificultad colapsable
  data/              # Datos estaticos (wordbank ~2600 palabras, 13 categorias)
  lib/               # Logica compartida
    algorithms/      # Algoritmos genericos (grid, shuffle)
    gameRegistry.ts  # Registro de juegos (Strategy Pattern)
    print.ts         # Logica de descarga/impresion PDF
  pages/             # Paginas del router
  store/             # Estado global Zustand
  types/             # Tipos compartidos
  test/              # Configuracion de tests
```

---

## Sistema de juegos (Strategy Pattern)

Cada juego implementa la interfaz `GameDefinition<TOutput, TConfig>` definida en `src/types/games.ts`:

```typescript
interface GameDefinition<TOutput, TConfig extends GameConfig> {
  generate(config: TConfig): TOutput;
  Preview: FC<{ data: TOutput; config: TConfig }>;
  defaultConfig: TConfig;
}
```

### Estructura de cada juego

```
src/components/games/<game>/
  types.ts       # Tipos especificos del juego
  generate.ts    # Logica de generacion del puzzle
  generate.test.ts  # Tests de generacion
  <Game>.tsx     # Componentes de visualizacion (Preview, Online, Print)
  <Game>PDF.tsx  # Componente para renderizado PDF
  index.ts       # Re-exporta todo + crea GameDefinition
```

### Como agregar un juego nuevo

1. Crear la carpeta `src/components/games/<nuevo-juego>/` con la estructura de arriba
2. Definir tipos (`types.ts`) extendiendo `GameConfig`
3. Implementar `generate()` que devuelva el output del puzzle
4. Crear componente/s de preview
5. Crear componente PDF
6. Exportar `GameDefinition` desde `index.ts`
7. Importar y registrar en `src/lib/gameRegistry.ts` con `registerGame()`

---

## Sistema de diseno crystal glass

### Archivo clave: `src/app.css`

Usa Tailwind CSS v4 con `@theme`, `@utility` y variables CSS para theming completo.

### Crystal glass effect

Inspirado en Spatial UI / VisionOS — mas cristalino que el glass standard:

| Propiedad | Valor | Efecto |
|-----------|-------|--------|
| backdrop-filter | `blur(40px) saturate(180%)` | Alto desenfoque con saturacion para brillo tipo cristal |
| background | `rgba(255,255,255,0.25)` light / `rgba(255,255,255,0.06)` dark | Muy transparente |
| border | `0.5px solid` | Bordes finisimos tipo hairline |
| border-radius | `24px` cards / `22px` botones / `14px` selects |

### Sombras

| Elemento | Sombra | Opacidad |
|----------|--------|----------|
| Card normal | `0 2px 8px + 0 8px 32px` | 0.04-0.06 |
| Card hover | `0 4px 16px + 0 12px 48px` | 0.06-0.08 |
| Boton | `0 2px 8px` | 0.06 |
| Boton hover | `0 4px 16px accent-glow` | Con color |

### Temas: `.light` y `.dark`

Cada tema define ~30 variables CSS:

| Variable | Light | Dark | Proposito |
|----------|-------|------|-----------|
| `--bg-base` | `#FAF5FF` | `#07080F` | Fondo base |
| `--bg-gradient` | `#FAF5FF → #F0F4FF` | `#07080F → #0F1123` | Fondo del body |
| `--card-bg` | `rgba(255,255,255,0.25)` | `rgba(255,255,255,0.06)` | Fondo de tarjetas glass |
| `--card-border` | `rgba(255,255,255,0.48)` | `rgba(99,102,241,0.15)` | Borde de tarjetas |
| `--accent` | `#6366F1` (indigo) | `#818CF8` (indigo claro) | Color primario de acento |
| `--accent-glow` | `rgba(99,102,241,0.15)` | `rgba(129,140,248,0.12)` | Brillo del acento |
| `--secondary` | `#2DD4BF` (teal) | `#2DD4BF` (teal) | Color secundario |
| `--secondary-glow` | `rgba(45,212,191,0.15)` | `rgba(45,212,191,0.12)` | Brillo secundario |
| `--rose` | `#F472B6` (pink) | `#EC4899` (pink) | Color de CTA / acento |
| `--rose-glow` | `rgba(244,114,182,0.2)` | `rgba(236,72,153,0.2)` | Brillo de CTA |
| `--text-primary` | `#1E1B4B` | `#F1F5F9` | Texto principal |
| `--text-muted` | `#6B7280` | `#94A3B8` | Texto secundario |

### Paleta de colores

- **Primario (Indigo):** `#6366F1` / `#818CF8` — energia creativa con legibilidad educativa
- **Secundario (Teal):** `#2DD4BF` — frescura, contraste equilibrado
- **Acento (Rose):** `#EC4899` / `#F472B6` — para CTAs y elementos de accion
- **Blobs ambientales:** Indigo, Teal, Rose con animacion flotante

### Custom utilities de Tailwind

Definidas con `@utility` en app.css:
- `glass-card` — tarjeta con efecto cristal
- `glass-card-hover` — tarjeta con hover elevacion
- `glass-btn` — boton tipo cristal con estados
- `glass-select` — selector tipo cristal
- `text-primary`, `text-muted`, `text-accent` — colores de texto
- `glow-accent`, `glow-secondary`, `glow-rose` — sombra glow por color
- `blob`, `blob-delayed`, `blob-slow` — animaciones ambientales

### Tipografia

- **Headings y Body:** Montserrat (sans-serif) — Google Fonts

---

## Modo oscuro / claro

### Mecanismo

1. El tema se detecta al cargar la pagina via `prefers-color-scheme` o `localStorage.theme`
2. Se aplica como clase `.dark` o `.light` en `<html>` (script inline en `index.html` para evitar FOUC)
3. El componente `ThemeToggle` en `Layout.tsx` permite alternar manualmente mediante slider switch (sol/luna con animacion translateX)
4. La preferencia se persiste en `localStorage`

### Variables condicionales

```css
.light { --card-bg: rgba(255, 255, 255, 0.25); }
.dark  { --card-bg: rgba(255, 255, 255, 0.06); }
```

No se usan `@media (prefers-color-scheme)` ni variantes `dark:` de Tailwind; el theming se maneja 100% con clases y variables CSS.

---

## Navegacion (Navbar)

Barra superior centrada con 5 items: Inicio, Sopa, Sudoku, Laberinto, Tres Raya.

Cada item comienza como un circulo de 42-46px con icono SVG. Al hacer hover, se expande a 100-120px (`hover:w-[100px] lg:hover:w-[120px]`) con `transition-all duration-500` y muestra el nombre del juego. El hover incluye un gradient indigo-rose.

**Mobile (< 640px):** Se muestra un hamburger menu (icono ☰/✕) que despliega un menu vertical con todos los items como links con icono + label, gradient de fondo al activo. Los links de navegacion tradicionales se ocultan con `hidden sm:flex`.

Los links se implementan con `<Link>` de React Router para resaltar el item activo con gradient de fondo.

### Layout responsive

El contenedor principal (`Layout.tsx`) usa `max-w-5xl` con padding responsive:
- Mobile: `px-4 py-6`
- Tablet+: `sm:px-6 sm:py-8`

El header y footer tambien usan `px-4 sm:px-6`.

---

## Componentes UI

### Button (`src/components/ui/Button.tsx`)

4 variantes con sistema de animacion slideIcon:

| Variant | Estilo | Uso |
|---------|--------|-----|
| `primary` | Gradient indigo-rose + glow | Accion principal |
| `secondary` | Glass con borde semitransparente | Accion secundaria |
| `tertiary` | Ghost con blur-sm tenue | Volver / acciones sutiles |
| `danger` | Gradient rojo oscuro + overlay hover blanco | Limpiar / resetear |

Prop `slideIcon`: cuando se provee un elemento JSX, al hacer hover el texto se desliza horizontalmente y un overlay con el icono escala de 0 a 1.

### Select (`src/components/ui/Select.tsx`)
Wrapper del `<select>` nativo con clase `glass-select`. Los `<option>` usan `var(--option-bg)` para coincidir con el tema.

### DifficultySelector (`src/components/ui/DifficultySelector.tsx`)
Selector colapsable con 4 niveles: Facil, Medio, Dificil, Experto.

---

## Sopa de Letras — Funcionalidades especificas

### Modos de generacion
- **Aleatorio:** palabras aleatorias del banco general (~2600 palabras, 13 categorias)
- **Tematico:** palabras filtradas por tematica (12 temas: naturaleza, autos, valores, animales, etc.)
- **Personalizado:** el usuario ingresa sus propias palabras

### Niveles de dificultad

| Nivel | Direcciones | Longitud palabras | Intersecciones |
|-------|------------|-------------------|----------------|
| Facil | 2 (derecha, abajo) | Cortas (3-5) | No |
| Medio | 3 (+ diagonal) | Cortas y medias (3-8) | No |
| Dificil | 6 (+ reversas) | Cortas a largas | Si |
| Experto | 8 (todas) | Cortas a largas | Si + concatenacion |

### Generacion masiva (sheetCount)
- Campo `sheetCount: number` (1-10) en `WordSearchConfig`
- En Generator, al generar con `sheetCount > 1`, `regenerate()` produce un array de `WordSearchOutput[]`
- El store guarda el array completo; la preview muestra la primera sopa con paginador
- PrintPreview: paginacion entre sopas + PDF multi-pagina (un `<Page>` por sopa)
- PlayOnline: paginacion + auto-advance: al completar una sopa via `onComplete`, avanza tras 1.5s

### Modo online (drag-to-select)
- El jugador hace clic en una celda, arrastra en linea recta (horizontal/vertical/diagonal) y suelta para validar la palabra
- Las palabras encontradas se marcan en verde
- Cuando se encuentran todas, se muestra mensaje de felicitaciones
- El puzzle se genera fresh en cada carga (anti-trampas)

### Touch events (seleccion en mobile)
OnlineGrid maneja eventos touch ademas de mouse:
- `onTouchStart` en cada celda → inicia seleccion (como `mousedown`)
- `onTouchMove` en cada celda → usa `document.elementFromPoint(touch.clientX, touch.clientY)` para detectar la celda bajo el dedo y sombrea en amarillo (como `mouseenter`)
- `touchend` global (via `document.addEventListener`) → valida la palabra (como `mouseup`)
- `touch-none` (CSS `touch-action: none`) en el grid para prevenir scroll durante seleccion
- Sin `preventDefault()` redundante (eventos touch son pasivos por defecto)

## Laberinto — Funcionalidades especificas

### Niveles de dificultad

| Nivel | Grid (celdas) | Algoritmo | Caminos alternativos |
|-------|--------------|-----------|---------------------|
| Facil | 5x5 | Braided (DFS + ~25% dead-end removal) | Si — mas facil |
| Medio | 8x8 | DFS perfecto | No |
| Dificil | 12x12 | DFS perfecto | No |
| Experto | 16x16 | DFS perfecto | No |

### Generacion (`generate.ts`)
- `DIFFICULTY_CONFIG` mapea dificultad a `{ size, braidChance }`
- `generateMazeDFS()` genera un laberinto perfecto (un solo camino) con DFS recursivo
- `braid(grid, chance)` recorre celdas sin salida (3 paredes) y elimina una pared con `chance` de probabilidad — solo se usa en Facil
- `solveMazeBFS()` resuelve con BFS para obtener la solucion
- El `size` en el config se ignora; el tamano se deriva exclusivamente de la dificultad

### Modo online (`MazeOnline.tsx`)
- Path trazado clickeando celdas adyacentes abiertas (distancia Manhattan 1 en espacio de paredes)
- Click en la celda anterior → backtrack (elimina el ultimo paso)
- Flechas del teclado para moverse
- Boton "Limpiar camino" (variant `danger` con slideIcon) para resetear
- Deteccion de completado: cuando el path llega a la meta → `onComplete()`
- Grid responsive con `useResponsiveCell(wallCols, maxCell, 1)`

### PDF (`MazePDF.tsx`)
- Header: titulo + tamano + dificultad
- Instrucciones: "Encuentra el camino desde la salida (verde) hasta la meta (rojo)"
- Grilla: start verde, end rojo, solucion azul
- Footer: dominio
- `SolutionPDF` exportado para incluir pagina de solucion en el PDF (toggle en PrintPreview)
- Tamanio de celda calculado como `min(floor(min(W, H80) / wallCols * 1.3), 73)` en ambos casos (×1.3)

### Grid responsive (useResponsiveCell)

Todas las grillas usan el hook `useResponsiveCell(cols, maxCell, gapPx)`:
- Mide el contenedor via `ResizeObserver`
- Calcula `cellPx = floor((containerWidth - padding - gaps) / cols)`, clamp entre 16px y maxCell
- El glass-card usa `w-full sm:w-fit` para que en mobile ocupe todo el ancho y en desktop se centre

| Juego | Uso |
|-------|-----|
| Sopa de Letras | `useResponsiveCell(cols, 36)` con `mode` para elegir variante |
| Sudoku | `useResponsiveCell(size, maxCell, 1)` con `maxCell` segun tamanio (72/64/56) |
| Maze | `useResponsiveCell(wallCols, maxCell, 1)` con `maxCell` segun dificultad (48/36/28/22) |
| TicTacToe | Layout fijo sin hook |

---

## Estado global (Zustand)

Store definido en `src/store/generator.ts`:

```typescript
interface GeneratorStore {
  configs: Record<string, any>;     // configuracion actual por juego
  data: Record<string, StoredData>; // datos generados { config, output }
  // metodos: setCurrentConfig, getCurrentConfig, setGeneratedData, getGeneratedData, clearGeneratedData
}
```

Los datos generados persisten en memoria al navegar entre paginas (Generator → PrintPreview), pero no persisten al recargar la pagina.

---

## PDF

### Libreria: @react-pdf/renderer
- Componentes: `<Document>`, `<Page>`, `<View>`, `<Text>`, `<StyleSheet>`
- Tamano de pagina: LETTER (612 x 792 pt)
- Fuente: Helvetica (built-in, sin registro externo para evitar fallos de red)
- **Escalado de grillas:** todas las `calcCell()` aplican un factor ×1.3 al raw px y los caps se incrementan proporcionalmente (ej. 56→73, 80→104, 52→68) para mejor legibilidad impresa

### Flujo de descarga
1. Se construye el arbol JSX del documento (`GamePDFDocument > <Game>PDF`)
2. `pdf(doc).toBlob()` genera un Blob
3. Se crea un `<a>` con URL.createObjectURL() y se hace clic programaticamente

### Flujo de impresion
1. Mismo proceso hasta obtener el Blob
2. Se abre el PDF en una pestana nueva con `window.open(url, '_blank')`
3. El usuario imprime desde el visor nativo del navegador
4. Si el popup es bloqueado, se descarga como fallback

### PDF de Sopa de Letras (`WordSearchPDF.tsx`)
- **Encabezado:** Titulo + subtitulo con tematica (si aplica), dificultad y cantidad de palabras
- **Instrucciones:** Texto en cursiva negrita indicando direcciones de busqueda segun dificultad
- **Grilla:** Letras en Helvetica bold con fondo #fafafa y bordes #ccc
- **Footer:** Lista de palabras a buscar
- **Multi-pagina:** PrintPreview genera un `<Document>` con multiples `<Page>` cuando hay varias sopas

### PDF de Laberinto (`MazePDF.tsx`)
- **Encabezado:** Titulo + tamano de grid + dificultad
- **Instrucciones:** "Encuentra el camino desde la salida (verde) hasta la meta (rojo)"
- **Grilla:** Start en verde, end en rojo, celdas de pared en negro, abiertas en blanco, solucion en azul
- **Footer:** Dominio
- **Solucion:** `SolutionPDF` exportado para pagina extra con el camino resuelto
- **Tamanio de celda:** `min(floor(min(W, H80) / wallCols * 1.3), 73)` — escala ×1.3 para mejor legibilidad, cap 73px

### PrintPreview: toggle de solucion
El checkbox "Incluir solucion en PDF" en PrintPreview se oculta condicionalmente cuando `gameId === "tictactoe"`, ya que Tres en Raya no requiere pagina de solucion. Los demas juegos (WordSearch, Sudoku, Maze) muestran el toggle si exportan un `SolutionPDF`.

### Lazy loading
Los componentes PDF se cargan dinamicamente con `getPDFComponent(gameId)` que usa `import()`.

---

## Skills instalados (OpenCode)

Directorio: `.opencode/skills/`

| Skill | Proposito |
|-------|-----------|
| `algorithm-patterns` | Patrones de algoritmos para generacion de juegos imprimibles |
| `game-definition` | Interfaz GameDefinition para definir juegos |
| `react-pdf-builder` | Guia de uso de @react-pdf/renderer para PDFs vectoriales |
| `customize-opencode` | Configuracion del asistente opencode |

Los skills se cargan automaticamente segun el contexto de la conversacion con la IA.

### Analisis: .opencode en el repositorio

El directorio `.opencode/` contiene la configuracion de la herramienta opencode (skills, node_modules, package.json). Se rastrea en git porque:

**A favor de mantenerlo:**
- Skills como `game-definition`, `react-pdf-builder` y `algorithm-patterns` son especificos del proyecto y mejoran la asistencia de la IA
- Cualquier desarrollador que use opencode obtiene el mismo contexto
- `node_modules/` esta ignorado por el `.gitignore` raiz (solo se trackean archivos ligeros: markdown, JSON, scripts)

**En contra:**
- Skills genericos (ui-ux-pro-max, design, brand, banner-design, design-system, slides, ui-styling) no son especificos del proyecto — agregan ~60 archivos de ruido
- Es dependiente de una herramienta externa (opencode)

**Recomendacion:** Mantener `.opencode/` en el repo pero eliminar los skills genericos de diseno, dejando solo los esenciales del proyecto: `game-definition`, `react-pdf-builder`, `algorithm-patterns` y `customize-opencode`.

---

## Testing

```bash
npm run test         # Ejecuta todos los tests
npm run test -- --watch  # Modo watch
```

Los tests usan:
- **Vitest** como corredor de tests
- **@testing-library/jest-dom** para asserts DOM
- **jsdom** como entorno de navegador simulado

Ubicacion de tests: cada `generate.test.ts` vive junto a su `generate.ts`.

---

## Comandos utiles

```bash
npm run dev       # Dev server (hot reload)
npm run build     # tsc -b && vite build (typecheck + bundle)
npm run lint      # ESLint con flat config
npm run format    # Prettier
npm run test      # Vitest
npm run preview   # Preview build produccion
```

---

## Git workflow

```bash
git add <archivos>
git commit -m "tipo: mensaje descriptivo"
git push origin main
```

Convencion de mensajes:
- `feat:` — nueva funcionalidad
- `fix:` — correccion de bug
- `docs:` — documentacion
- `refactor:` — refactor sin cambios funcionales
- `style:` — solo formato/estilo (no CSS funcional)

---

## Estructura de rutas

| Path | Componente | Descripcion |
|------|-----------|-------------|
| `/` | Home | Pantalla de inicio con tarjetas de juegos |
| `/generator/:game` | Generator | Configuracion y generacion del puzzle |
| `/print/:game` | PrintPreview | Vista previa para impresion/descarga PDF |
| `/play/:game` | PlayOnline | Juego interactivo online |

Las rutas `/print` y `/play` estan lazy-loaded con `React.lazy()`.

---

---

## Deploy (GitHub Pages)

### Automático (GitHub Actions)
El archivo `.github/workflows/deploy.yml` despliega automaticamente al hacer push a `main`:
1. `actions/checkout@v4` — clona el repo
2. `actions/setup-node@v4` — instala Node 22
3. `npm ci` — instala dependencias
4. `npm run build` — compila con `tsc -b && vite build`
5. `actions/upload-pages-artifact@v3` — sube `dist/`
6. `actions/deploy-pages@v4` — despliega a GitHub Pages

### Configuracion necesaria en GitHub
1. Repo → Settings → Pages → Source: **GitHub Actions**
2. Environment `github-pages` creado automaticamente por `actions/deploy-pages`

### Build local
```bash
npm run build    # Produce dist/
npx vite preview # Sirve localmente el build
```

### Vite base path
En `vite.config.ts`, `base` se ajusta automaticamente:
- Local (`process.env.GITHUB_ACTIONS` no definido): `base: "/"`
- GitHub Actions: `base: "/Generador-de-juegos-para-imprimir/"`

### React Router basename
En `src/main.tsx`, el `BrowserRouter` usa `import.meta.env.BASE_URL` como `basename`, que coincide con el `base` de Vite.

---

## Notas sobre ESLint y TypeScript config

### ESLint (flat config)
- Archivo: `eslint.config.js`
- Extiende: `js.configs.recommended`, `tseslint.configs.recommended`
- Plugins: `react-hooks`, `react-refresh`
- Con `prettier` para evitar conflictos de formato

### TypeScript strict mode
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- `moduleResolution: "bundler"` — compatible con Vite
- `jsx: "react-jsx"` — React 19 JSX transform
