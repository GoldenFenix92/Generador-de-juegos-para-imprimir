import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

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
  boardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  board: { flexDirection: "column", alignItems: "center", margin: 10 },
  row: { flexDirection: "row" },
  footer: {
    height: H - H80 - H6 - H5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  footerText: { fontSize: 9, color: "#999", textAlign: "center" },
});

function calcCell(boardCount: number, gridSize: number): number {
  const boardsPerRow = boardCount <= 1 ? 1 : boardCount <= 2 ? 2 : boardCount <= 4 ? 2 : boardCount <= 6 ? 3 : 4;
  const cols = Math.min(boardsPerRow, boardCount);
  const rows = Math.ceil(boardCount / cols);
  const availW = (W - (cols - 1) * 20) / cols;
  const availH = (H80 - (rows - 1) * 20) / rows;
  const px = Math.floor(Math.min(availW / gridSize, availH / gridSize));
  return Math.min(px, boardCount <= 1 ? 104 : 52);
}

function TicTacToeBoard({ grid, cellPx, label }: {
  grid: (null | "X" | "O")[][];
  cellPx: number;
  label?: string;
}) {
  return (
    <View style={styles.board}>
      {label && <Text style={{ fontSize: 8, marginBottom: 4, color: "#888" }}>{label}</Text>}
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: cellPx,
                height: cellPx,
                borderWidth: 0.5,
                borderColor: "#000",
                backgroundColor: "#fafafa",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {cell ? (
                <Text style={{ fontSize: cellPx * 0.5, fontWeight: 700, color: cell === "X" ? "#6366F1" : "#EC4899" }}>
                  {cell}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

interface TicTacToePDFProps {
  data: TicTacToeOutput;
  config: TicTacToeConfig;
}

export default function TicTacToePDF({ data, config }: TicTacToePDFProps) {
  const gridSize = data.gridSize;
  const boardCount = config.sheetCount ?? 1;
  const cellPx = calcCell(boardCount, gridSize);

  const boards = Array.from({ length: boardCount }, (_, i) => ({
    grid: Array.from({ length: gridSize }, () => Array(gridSize).fill(null)),
    label: boardCount > 1 ? `Tablero ${i + 1}` : undefined,
  }));

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Tres en Raya</Text>
        <Text style={styles.subtitle}>
          {gridSize}x{gridSize} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Juego para dos jugadores. Coloca tus marcas (X y O) en las casillas vacias. El primero en alinear {gridSize === 4 ? "4" : "3"} en raya gana.
        </Text>
      </View>

      <View style={styles.body}>
        {boardCount <= 1 ? (
          <TicTacToeBoard grid={data.grid} cellPx={cellPx} />
        ) : (
          <View style={styles.boardsContainer}>
            {boards.map((b, i) => (
              <TicTacToeBoard key={i} grid={b.grid} cellPx={cellPx} label={b.label} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>generadordejuegos.com</Text>
      </View>
    </View>
  );
}

export function SolutionPDF({ data, config }: TicTacToePDFProps) {
  const gridSize = data.gridSize;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Tres en Raya — Partida ejemplo</Text>
        <Text style={styles.subtitle}>
          {gridSize}x{gridSize} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Ejemplo de partida completa. Las X y O muestran una posible secuencia de juego.
        </Text>
      </View>

      <View style={styles.body}>
        <TicTacToeBoard grid={data.grid} cellPx={calcCell(1, gridSize)} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>generadordejuegos.com</Text>
      </View>
    </View>
  );
}
