# react-pdf-builder

Guía para usar `@react-pdf/renderer` para generar PDFs vectoriales de alta calidad en proyectos React + TypeScript.

## API principal

### Componentes básicos
- `<Document>` — Raíz del PDF
- `<Page>` — Una página del documento (acepta `size`: `"A4"`, `"LETTER"`, etc.)
- `<View>` — Contenedor (como un `div`)
- `<Text>` — Texto (hereda estilos)
- `<Svg>`, `<Rect>`, `<Line>`, `<Circle>` — Gráficos vectoriales

### Estilos con `StyleSheet.create`
```ts
import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 20, textAlign: "center" },
});
```

### Generar y descargar
```ts
import { pdf } from "@react-pdf/renderer";

const blob = await pdf(<MyDocument />).toBlob();
const url = URL.createObjectURL(blob);
// crear link y descargar
```

## Patrones para juegos imprimibles

### Cuadrículas (Sopa de Letras, Sudoku)
- Usar `View` anidados con `flexDirection: "row"` para filas
- `Text` con `fontFamily: "Courier"` para alineación monoespaciada
- Anidar `View` sin `flex` para celdas de tamaño fijo (`width`/`height`)

### Muros/Laberintos
- Usar `View` pequeños (8x8px) con `backgroundColor` para paredes
- Alternar colores para celdas abiertas/cerradas

### Tableros (Tres en Raya)
- `View` con `borderWidth` para las líneas del tablero

## Buenas prácticas
- Componentes PDF separados de la vista React (`*Game*PDF.tsx`)
- Estilos tipados con `as const` en `textAlign`
- No usar Tailwind en componentes PDF (solo `StyleSheet`)
