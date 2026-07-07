# Generador de Juegos Imprimibles

Aplicacion web para generar, personalizar y descargar juegos educativos en PDF listos para imprimir.

🌐 **Live:** [https://goldenfenix92.github.io/Generador-de-juegos-para-imprimir/](https://goldenfenix92.github.io/Generador-de-juegos-para-imprimir/)

## Juegos disponibles

- **Sopa de Letras** — Busca palabras ocultas en una cuadricula. Con 3 modos de generacion (aleatorio, tematico, personalizado), 4 niveles de dificultad, generacion masiva de hasta 10 hojas y modo online interactivo con drag-to-select.
- **Sudoku** — Completa la cuadricula con numeros del 1 al 9.
- **Laberinto** — Encuentra el camino desde la entrada hasta la salida.
- **Tres en Raya** — Clasico juego de tablero para dos jugadores.

## Como usar

1. Abri la app en el navegador
2. Selecciona un juego desde la barra de navegacion superior o la pantalla de inicio
3. Configura los parametros (dificultad, modo, palabras, cantidad de sopas, etc.)
4. Hace clic en **"Generar nueva Sopa de Letras"** para crear el puzzle
5. Navega entre las sopas generadas con los botones Anterior/Siguiente
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

## Funcionalidades destacadas (Sopa de Letras)

- **Diseno responsive:** Navbar con hamburger menu en mobile, grillas adaptables, layout fluido
- **Touch support:** Modo online funciona con dedo (touchstart/touchmove/touchend) — sombreado en vivo de palabras
- **Generacion masiva:** hasta 10 sopas en un solo clic
- **Paginacion:** navega entre sopas en Generator, PrintPreview y PlayOnline
- **Auto-avance:** al completar una sopa en modo online, avanza automaticamente a la siguiente
- **3 modos de generacion:** Aleatorio, Tematico (12 temas), Personalizado
- **4 niveles de dificultad:** Facil, Medio, Dificil, Experto
- **PDF multi-pagina:** descarga todas las sopas en un solo documento con instrucciones por dificultad

## Scripts disponibles

```bash
npm run dev        # Inicia servidor de desarrollo
npm run build      # Compila para produccion
npm run preview    # Previsualiza el build de produccion
npm run test       # Ejecuta tests con Vitest
npm run lint       # Ejecuta ESLint
npm run format     # Formatea codigo con Prettier
```
