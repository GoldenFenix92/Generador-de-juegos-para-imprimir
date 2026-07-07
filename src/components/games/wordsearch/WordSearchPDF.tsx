import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { WordSearchConfig, WordSearchOutput } from "./types";

const MARGIN = 28;
const W = 612 - MARGIN * 2;
const H = 792 - MARGIN * 2;
const H80 = H * 0.80;
const H6 = H * 0.06;
const H4 = H * 0.04;

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

const DIRECTION_LABELS: Record<string, string> = {
  easy: "Las palabras pueden estar en estas direcciones: derecha (→) y abajo (↓).",
  medium: "Las palabras pueden estar en estas direcciones: derecha (→), abajo (↓) y diagonal (↘).",
  hard: "Las palabras pueden estar en estas direcciones: derecha, abajo, diagonal y sus reversas (←, ↑, ↖, ↙).",
  expert: "Las palabras pueden estar en todas las direcciones posibles, incluyendo palabras concatenadas entre si.",
};

const LABEL: Record<string, string> = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
  expert: "Experto",
};

const THEME_LABELS: Record<string, string> = {
  naturaleza: "Naturaleza",
  autos: "Autos",
  valores: "Valores",
  animales: "Animales",
  colores: "Colores",
  comida: "Comida",
  deportes: "Deportes",
  profesiones: "Profesiones",
  musica: "Musica",
  viajes: "Viajes",
  casa: "Casa",
  ropa: "Ropa",
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
    height: H4 + 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
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
    height: H - H80 - H6 - H4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  list: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  word: { fontSize: 11, marginHorizontal: 5, marginBottom: 3, color: "#222", fontWeight: 600 },
});

interface Props {
  data: WordSearchOutput;
  config: WordSearchConfig;
}

export default function WordSearchPDF({ data, config }: Props) {
  const g = getGridSize(config.wordCount);
  const { px: cellPx, fs: cellFs } = calcCell(g);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Sopa de Letras</Text>
        <Text style={styles.subtitle}>
          {config.generationMode === "themed" && config.theme
            ? `Tematica: ${THEME_LABELS[config.theme] ?? config.theme} · `
            : config.generationMode === "custom"
              ? "Personalizado · "
              : ""}
          Dificultad: {LABEL[config.difficulty] ?? "Facil"} · {data.words.length} palabras
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          {DIRECTION_LABELS[config.difficulty] ?? DIRECTION_LABELS.easy}
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
