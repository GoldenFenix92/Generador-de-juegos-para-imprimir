# Generador de Juegos Imprimibles

Aplicacion web para generar, personalizar y descargar juegos educativos en PDF listos para imprimir.

🌐 **Live:** [https://goldenfenix92.github.io/Generador-de-juegos-para-imprimir/](https://goldenfenix92.github.io/Generador-de-juegos-para-imprimir/)

## Juegos disponibles

- **Sopa de Letras** — Busca palabras ocultas en una cuadricula. Con 3 modos de generacion (aleatorio, tematico, personalizado), 4 niveles de dificultad, generacion masiva de hasta 10 hojas y modo online interactivo con drag-to-select.
- **Sudoku** — Completa la cuadricula con numeros del 1 al 9.
- **Laberinto** — Encuentra el camino desde la salida (verde) hasta la meta (rojo). 4 niveles de dificultad, modo online interactivo para trazar el camino, PDF con solucion.
- **Tres en Raya** — Clasico juego de tablero para dos jugadores (sin solucion en PDF).
- **Crucigrama** — Completa las palabras cruzadas con la ayuda de las pistas.

## Como usar

1. Abri la app en el navegador
2. Selecciona un juego desde la barra de navegacion superior o la pantalla de inicio
3. Configura los parametros (dificultad, modo, palabras, cantidad, etc.)
4. Hace clic en **"Generar"** para crear el puzzle
5. Navega entre las hojas generadas con los botones Anterior/Siguiente
6. **"Ver para imprimir"** — descarga el PDF (todas las paginas) o imprime directo
7. **"Jugar online"** — resolve los puzzles en pantalla con auto-avance al completar cada uno

## Tecnologias

- React 19 + TypeScript 6
- Vite 8 como bundler
- Tailwind CSS v4 con sistema de diseno crystal glass (blur 40px + saturate 180%)
- React Router v7 para navegacion
- Zustand para estado global
- @react-pdf/renderer para generacion de PDFs
- Vitest para tests unitarios
- GitHub Pages para deploy automatico

## Diseno

- **Estilo:** Crystal glass semi-transparente (inspirado en Spatial UI / VisionOS)
- **Paleta:** Indigo (#6366F1) + Teal (#2DD4BF) + Rose (#EC4899)
- **Tipografia:** Montserrat (Google Fonts)
- **Modo oscuro/claro:** Deteccion automatica + selector manual tipo slider

## Funcionalidades destacadas

- **Diseno responsive:** Navbar con hamburger menu en mobile, grillas adaptables con `useResponsiveCell`, layout fluido
- **Touch support:** Modo online funciona con dedo y raton
- **Generacion masiva:** hasta 10 hojas en un solo clic
- **Paginacion:** navega entre hojas en Generator, PrintPreview y PlayOnline
- **Auto-avance:** al completar un puzzle en modo online, avanza automaticamente al siguiente
- **4 niveles de dificultad:** Facil, Medio, Dificil, Experto con progresion cualitativa en cada juego
- **PDF multi-pagina:** descarga todas las hojas en un solo documento con instrucciones y pagina de solucion opcional
- **Grillas PDF mas grandes:** los tamanos maximos de celda se incrementaron ×1.3 para mejor legibilidad impresa (el grid siempre cabe en la pagina)
- **Modo online interactivo:** trazado de camino en laberintos, drag-to-select en sopa de letras, numpad en sudoku

## Scripts disponibles

```bash
npm run dev        # Inicia servidor de desarrollo
npm run build      # Compila para produccion
npm run preview    # Previsualiza el build de produccion
npm run test       # Ejecuta tests con Vitest
npm run lint       # Ejecuta ESLint
npm run format     # Formatea codigo con Prettier
```
