import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { MazeConfig, MazeOutput } from "./types";

const MARGIN = 28;
const W = 612 - MARGIN * 2;
const H = 792 - MARGIN * 2;
const H80 = H * 0.80;
const H6 = H * 0.06;
const H5 = H * 0.05;

const LABEL: Record<string, string> = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
  expert: "Experto",
};

function calcCell(g: number): number {
  const px = Math.floor(Math.min(W / g, H80 / g) * 1.3);
  return Math.min(px, 73);
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
  body: {
    height: H80,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  footer: {
    height: H - H80 - H6 - H5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  footerText: { fontSize: 9, color: "#999", textAlign: "center" },
});

interface MazePDFProps {
  data: MazeOutput;
  config: MazeConfig;
}

function MazeGrid({ data, showSolution }: { data: MazeOutput; showSolution: boolean }) {
  const { walls, start, end, solution } = data;
  const wallCols = walls[0].length;
  const cellPx = calcCell(wallCols);

  const solutionSet = new Set<string>();
  if (showSolution) {
    for (const [r, c] of solution) {
      solutionSet.add(`${r * 2 + 1},${c * 2 + 1}`);
    }
  }

  return (
    <View style={styles.grid}>
      {walls.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((isWall, c) => {
            const isStart = r === start[0] * 2 + 1 && c === start[1] * 2 + 1;
            const isEnd = r === end[0] * 2 + 1 && c === end[1] * 2 + 1;
            const isSolutionCell = showSolution && solutionSet.has(`${r},${c}`);

            return (
              <View
                key={c}
                style={{
                  width: cellPx,
                  height: cellPx,
                  backgroundColor: isStart
                    ? "#22C55E"
                    : isEnd
                      ? "#EF4444"
                      : isSolutionCell
                        ? "#60A5FA"
                        : isWall
                          ? "#111827"
                          : "#FFFFFF",
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function MazePDF({ data, config }: MazePDFProps) {
  const wallCols = data.walls[0].length;
  const cellSize = (wallCols - 1) / 2;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Laberinto</Text>
        <Text style={styles.subtitle}>
          {cellSize}x{cellSize} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Encuentra el camino desde la salida (verde) hasta la meta (rojo).
        </Text>
      </View>

      <View style={styles.body}>
        <MazeGrid data={data} showSolution={false} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>generadordejuegos.com</Text>
      </View>
    </View>
  );
}

export function SolutionPDF({ data, config }: MazePDFProps) {
  const wallCols = data.walls[0].length;
  const cellSize = (wallCols - 1) / 2;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Laberinto — Solucion</Text>
        <Text style={styles.subtitle}>
          {cellSize}x{cellSize} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.body}>
        <MazeGrid data={data} showSolution={true} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>generadordejuegos.com</Text>
      </View>
    </View>
  );
}
