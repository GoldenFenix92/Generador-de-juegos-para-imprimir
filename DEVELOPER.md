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
    layout/          # Layout principal, header, footer, theme
    pdf/             # Componente base PDF (envoltura @react-pdf)
    ui/              # Componentes de interfaz reutilizables
  data/              # Datos estaticos (wordbank)
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

## Sistema de diseño glassmorphism

### Archivo clave: `src/app.css`

Usa Tailwind CSS v4 con `@theme`, `@utility` y variables CSS para theming completo.

### Temas: `.light` y `.dark`

Cada tema define ~30 variables CSS:

| Variable | Light | Dark | Proposito |
|----------|-------|------|-----------|
| `--bg-base` | `#F1F5F9` | `#0F172A` | Fondo base |
| `--bg-gradient` | gradiente suave | gradiente oscuro | Fondo del body |
| `--card-bg` | `rgba(255,255,255,0.65)` | `rgba(255,255,255,0.05)` | Fondo de tarjetas glass |
| `--card-border` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.12)` | Borde de tarjetas |
| `--accent` | `#0D9488` (teal) | `#14B8A6` (teal claro) | Color primario de acento |
| `--accent-glow` | `rgba(13,148,136,0.15)` | `rgba(20,184,166,0.2)` | Brillo del acento |
| `--text-primary` | `#1E293B` | `#F1F5F9` | Texto principal |
| `--text-muted` | `#64748B` | `#94A3B8` | Texto secundario |

### Paleta de colores

- **Primario (Teal):** `#0D9488` / `#14B8A6` — fresco, amigable, funciona para niños y adultos
- **Secundario (Violeta):** `#8B5CF6` — toque creativo
- **Acento cálido (Ambar):** `#D97706` — para CTAs y elementos de accion
- **Blobs ambientales:** Teal, Violeta, Amarillo (light) / Teal, Violeta, Ambar (dark)

### Efecto glass

Implementado con:
- `backdrop-filter: blur(24px)` — desenfoque tipo vidrio
- `background: rgba(...)` con opacidad baja — transparencia
- `border: 1px solid rgba(...)` — bordes semitransparentes visibles
- Sombras con expansion media y opacidad muy baja:
  - Cards: `0 2px 8px (0.04)` + `0 8px 32px (0.06)`
  - Hover: `0 4px 16px (0.06)` + `0 12px 48px (0.08)`
  - Botones: `0 2px 8px (0.06)`

### Paleta de sombras

| Elemento | Sombra | Expansion | Opacidad |
|----------|--------|-----------|----------|
| Card normal | `0 2px 8px + 0 8px 32px` | Media | Muy tenue (0.04-0.06) |
| Card hover | `0 4px 16px + 0 12px 48px` | Media-alta | Tenue (0.06-0.08) |
| Boton | `0 2px 8px` | Media | Muy tenue (0.06) |
| Boton hover | `0 4px 16px accent-glow` | Media | Con color |

### Custom utilities de Tailwind

Definidas con `@utility` en app.css:
- `glass-card` — tarjeta con efecto vidrio
- `glass-card-hover` — tarjeta con hover elevacion
- `glass-btn` — boton tipo vidrio con Estados
- `glass-select` — selector tipo vidrio
- `text-primary`, `text-muted`, `text-accent` — colores de texto
- `glow-accent` — sombra glow del acento
- `blob`, `blob-delayed`, `blob-slow` — animaciones ambientales

### Tipografia

- **Headings:** Crimson Pro (serif) — Google Fonts
- **Body:** Atkinson Hyperlegible (sans-serif) — Google Fonts, disenada para legibilidad

---

## Modo oscuro / claro

### Mecanismo

1. El tema se detecta al cargar la pagina via `prefers-color-scheme` o `localStorage.theme`
2. Se aplica como clase `.dark` o `.light` en `<html>` (script inline en `index.html` para evitar FOUC)
3. El componente `ThemeToggle` en `Layout.tsx` permite alternar manualmente
4. La preferencia se persiste en `localStorage`

### Variables condicionales

```css
.light { --card-bg: rgba(255, 255, 255, 0.65); }
.dark  { --card-bg: rgba(255, 255, 255, 0.05); }
```

No se usan `@media (prefers-color-scheme)` ni variantes `dark:` de Tailwind; el theming se maneja 100% con clases y variables CSS.

---

## Componentes UI

### Button (`src/components/ui/Button.tsx`)
Wrapper del `<button>` nativo con clase `glass-btn`. Hereda todas las variables de tema.

### Select (`src/components/ui/Select.tsx`)
Wrapper del `<select>` nativo con clase `glass-select`. Los `<option>` usan `var(--option-bg)` para coincidir con el tema.

### DifficultySelector (`src/components/ui/DifficultySelector.tsx`)
Select con 4 opciones: Facil, Medio, Dificil, Experto. Las opciones son configurables via prop.

---

## Sopa de Letras — Funcionalidades especificas

### Modos de generacion
- **Aleatorio:** palabras aleatorias del banco general
- **Tematico:** palabras filtradas por tematica (12 temas: naturaleza, autos, valores, animales, etc.)
- **Personalizado:** el usuario ingresa sus propias palabras

### Niveles de dificultad

| Nivel | Direcciones | Longitud palabras | Intersecciones |
|-------|------------|-------------------|----------------|
| Facil | 2 (derecha, abajo) | Cortas (3-5) | No |
| Medio | 3 (+ diagonal) | Cortas y medias (3-8) | No |
| Dificil | 6 (+ reversas) | Cortas a largas | Si |
| Experto | 8 (todas) | Cortas a largas | Si + concatenacion |

### Modo online (drag-to-select)
- El jugador hace clic en una celda, arrastra en linea recta (horizontal/vertical/diagonal) y suelta para validar la palabra
- Las palabras encontradas se marcan en verde
- Cuando se encuentran todas, se muestra mensaje de felicitaciones
- El puzzle se genera fresh en cada carga (anti-trampas)

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
- Fuente: Helvetica

### Flujo de descarga
1. Se construye el arbol JSX del documento (`GamePDFDocument > <Game>PDF`)
2. `pdf(doc).toBlob()` genera un Blob
3. Se crea un `<a>` con URL.createObjectURL() y se hace clic programaticamente

### Flujo de impresion
1. Mismo proceso hasta obtener el Blob
2. Se carga en un iframe oculto
3. Se llama a `iframe.contentWindow.print()`

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
| `ui-ux-pro-max` | Sistema de diseno premium con glassmorphism, paletas, tipografia y micro-interacciones |

Los skills se cargan automaticamente segun el contexto de la conversacion con la IA.

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
