# Generador de Juegos Imprimibles

Aplicacion web para generar, personalizar y descargar juegos educativos en PDF listos para imprimir.

## Juegos disponibles

- **Sopa de Letras** — Busca palabras ocultas en una cuadricula. Con 3 modos de generacion (aleatorio, tematico, personalizado), 4 niveles de dificultad y modo online interactivo con drag-to-select.
- **Sudoku** — Completa la cuadricula con numeros del 1 al 9.
- **Laberinto** — Encuentra el camino desde la entrada hasta la salida.
- **Tres en Raya** — Clasico juego de tablero para dos jugadores.

## Como usar

1. Abri la app en el navegador
2. Selecciona un juego de la pantalla de inicio
3. Configura los parametros (dificultad, modo, palabras, etc.)
4. Hace clic en **"Generar nueva Sopa de Letras"** (u opcion equivalente)
5. Previsualiza el resultado
6. **"Ver para imprimir"** — descarga el PDF o imprime directo
7. **"Jugar online"** — resolve el puzzle en pantalla con interaccion drag-to-select

## Tecnologias

- React 19 + TypeScript 6
- Vite 8 como bundler
- Tailwind CSS v4 con sistema de diseño glassmorphism
- React Router v7 para navegacion
- Zustand para estado global
- @react-pdf/renderer para generacion de PDFs
- Vitest para tests unitarios

## Modo oscuro / claro

La app soporta modo oscuro y claro con deteccion automatica del tema del sistema. Podes alternar manualmente desde el boton en el header (icono de sol/luna).

## Scripts disponibles

```bash
npm run dev        # Inicia servidor de desarrollo
npm run build      # Compila para produccion
npm run preview    # Previsualiza el build de produccion
npm run test       # Ejecuta tests con Vitest
npm run lint       # Ejecuta ESLint
npm run format     # Formatea codigo con Prettier
```
