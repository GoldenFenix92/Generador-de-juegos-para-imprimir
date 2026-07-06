# algorithm-patterns

Patrones de algoritmos para generación de juegos imprimibles.

## 1. Sopa de Letras — Greedy + Aleatorización

### Algoritmo
1. Por cada palabra, elegir dirección aleatoria (8 posibles)
2. Encontrar posición válida donde todas las letras encajen
3. Colocar palabra letra por letra
4. Rellenar celdas vacías con letras aleatorias

### Código ejemplo
```ts
function canPlace(grid, word, row, col, dr, dc) { ... }
function placeWord(grid, word, row, col, dr, dc) { ... }
function fillEmpty(grid) { ... }
```

## 2. Sudoku — Backtracking

### Algoritmo generador
1. Llenar las 3 cajas diagonales (independientes entre sí)
2. Resolver el resto con backtracking (DFS)
3. Remover celdas según dificultad, verificando solución única

### Backtracking
```ts
function solve(grid): boolean {
  encontrar celda vacía
  for num in 1..9 (orden aleatorio):
    if isValid(grid, row, col, num):
      grid[row][col] = num
      if solve(grid) return true
      grid[row][col] = 0  // backtrack
  return false
}
```

## 3. Laberinto — DFS Recursive Backtracker

### Algoritmo generador
1. Comenzar en celda [0,0]
2. Marcar como visitada
3. Elegir vecino no visitado aleatoriamente
4. Eliminar pared entre celdas
5. Mover al vecino, repetir
6. Si no hay vecinos, retroceder (pop de stack)

### Conversión a grid de paredes
- Tamaño: `(size * 2 + 1) x (size * 2 + 1)`
- Celdas internas en posiciones impares
- Paredes entre celdas se eliminan según conexiones

### BFS para resolver
```ts
function solveBFS(grid, start, end): path[]
```

## 4. Tres en Raya — Plantilla estática

### Generación
- Simplemente crear grid 3x3 vacío
- Sin lógica de juego activa (es para imprimir, no para jugar)

## 5. Utilidades compartidas
- `shuffle(array)`: Fisher-Yates shuffle
- `createGrid(rows, cols, fill)`: Crear grid 2D
- `cloneGrid(grid)`: Copia profunda de grid
