import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { SudokuConfig, SudokuOutput } from "./types";

const MARGIN = 28;
const W = 612 - MARGIN * 2;
const H = 792 - MARGIN * 2;
const H80 = H * 0.78;
const H6 = H * 0.06;
const H5 = H * 0.05;

const LABEL: Record<string, string> = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
  expert: "Experto",
};

function getBoxSize(size: number): { boxRows: number; boxCols: number } {
  if (size === 4) return { boxRows: 2, boxCols: 2 };
  if (size === 6) return { boxRows: 2, boxCols: 3 };
  return { boxRows: 3, boxCols: 3 };
}

function calcCell(g: number, isSolution = false): { px: number; fs: number } {
  const px = Math.floor(Math.min(W / g, H80 / g));
  const maxC = isSolution ? 44 : g <= 4 ? 94 : g <= 6 ? 78 : 68;
  const cell = Math.min(px, maxC);
  const fs = cell >= 32 ? 14 : cell >= 28 ? 12 : cell >= 22 ? 10 : cell >= 18 ? 9 : 8;
  return { px: cell, fs };
}

const styles = StyleSheet.create({
  page: { padding: MARGIN, fontFamily: "Helvetica" },
  header: {
    height: H6,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: 700, letterSpacing: 1 },
  subtitle: { fontSize: 11, marginTop: 2, color: "#555", fontWeight: 500 },
  instructions: {
    height: H5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  instrText: {
    fontSize: 9.5,
    color: "#666",
    fontWeight: 700,
    fontStyle: "italic",
    textAlign: "center",
  },
  instrBold: {
    fontSize: 9.5,
    color: "#444",
    fontWeight: 700,
    fontStyle: "italic",
    textAlign: "center",
  },
  body: {
    height: H80,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  cell: {
    textAlign: "center",
    fontFamily: "Helvetica",
    fontWeight: 600,
    borderWidth: 0.5,
    borderColor: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  footer: {
    height: H - H80 - H6 - H5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  footerText: { fontSize: 9, color: "#999", textAlign: "center" },
});

function SudokuGrid({ data, config: _config, showSolution }: { data: SudokuOutput; config: SudokuConfig; showSolution: boolean }) {
  const grid = showSolution ? data.solution : data.puzzle;
  const size = grid.length;
  const { boxRows, boxCols } = getBoxSize(size);
  const { px: cellPx, fs: cellFs } = calcCell(size, showSolution);

  return (
    <View style={styles.grid}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => {
            const rightThick = (c + 1) % boxCols === 0 && c < size - 1;
            const bottomThick = (r + 1) % boxRows === 0 && r < size - 1;
            return (
              <View
                key={c}
                style={[
                  styles.cell,
                  { width: cellPx, height: cellPx, fontSize: cellFs },
                  rightThick ? { borderRightWidth: 2, borderRightColor: "#000" } : {},
                  bottomThick ? { borderBottomWidth: 2, borderBottomColor: "#000" } : {},
                ]}
              >
                <Text>{cell !== 0 ? cell : ""}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

interface SudokuPDFProps {
  data: SudokuOutput;
  config: SudokuConfig;
}

export default function SudokuPDF({ data, config }: SudokuPDFProps) {
  const size = data.puzzle.length;
  const { boxRows, boxCols } = getBoxSize(size);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.subtitle}>
          {size}x{size} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Rellena las celdas vacias con numeros del 1 al {size} sin repetir en filas, columnas ni cuadros de {boxRows}x{boxCols}.
        </Text>
      </View>

      <View style={styles.body}>
        <SudokuGrid data={data} config={config} showSolution={false} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>generadordejuegos.com</Text>
      </View>
    </View>
  );
}

export function SolutionPDF({ data, config }: SudokuPDFProps) {
  const size = data.solution.length;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Sudoku — Solucion</Text>
        <Text style={styles.subtitle}>
          {size}x{size} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.body}>
        <SudokuGrid data={data} config={config} showSolution={true} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>generadordejuegos.com</Text>
      </View>
    </View>
  );
}
