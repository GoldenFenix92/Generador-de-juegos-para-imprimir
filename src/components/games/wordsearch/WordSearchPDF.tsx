import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { WordSearchConfig, WordSearchOutput } from "./types";

// Letter: 612 × 792 pt | Margen 1 cm ≈ 28 pt
const MARGIN = 28;
const W = 612 - MARGIN * 2;
const H = 792 - MARGIN * 2;
const H10 = H * 0.10;
const H80 = H * 0.80;

function getGridSize(wc: number): number {
  if (wc <= 5) return 10;
  if (wc <= 10) return 14;
  if (wc <= 15) return 18;
  return 22;
}

function calcCell(g: number): { px: number; fs: number } {
  const px = Math.floor(Math.min(W / g, H80 / g));
  const fs = px >= 40 ? 14 : px >= 28 ? 11 : px >= 20 ? 9 : px >= 14 ? 8 : 7;
  const cell = Math.min(px, 56);
  return { px: cell, fs };
}

const styles = StyleSheet.create({
  page: { padding: MARGIN, fontFamily: "Helvetica" },
  header: {
    height: H10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  subtitle: { fontSize: 10, marginTop: 2, color: "#555" },
  body: {
    height: H80,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  cell: {
    textAlign: "center",
    fontFamily: "Courier",
    fontWeight: "bold",
    borderWidth: 0.5,
    borderColor: "#bbb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    height: H10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  list: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  word: { fontSize: 8, marginHorizontal: 4, marginBottom: 1 },
});

interface Props {
  data: WordSearchOutput;
  config: WordSearchConfig;
}

const LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
  expert: "Experto",
};

export default function WordSearchPDF({ data, config }: Props) {
  const g = getGridSize(config.wordCount);
  const { px: cellPx, fs: cellFs } = calcCell(g);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Sopa de Letras</Text>
        <Text style={styles.subtitle}>
          Dificultad: {LABEL[config.difficulty] ?? "Fácil"} · {data.words.length} palabras
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.grid}>
          {data.grid.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((cell, c) => (
                <View
                  key={c}
                  style={[styles.cell, { width: cellPx, height: cellPx, fontSize: cellFs }]}
                >
                  <Text>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.list}>
          {data.words.map((w) => (
            <Text key={w} style={styles.word}>
              {w}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
