import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CrosswordConfig, CrosswordOutput } from "./types";

const MARGIN = 28;
const W = 612 - MARGIN * 2;
const H = 792 - MARGIN * 2;
const H70 = H * 0.70;
const H6 = H * 0.06;
const H5 = H * 0.05;

const LABEL: Record<string, string> = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
  expert: "Experto",
};

function calcCell(g: number): number {
  const px = Math.floor(Math.min(W / g, H70 / g));
  return Math.min(px, 56);
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
    height: H70,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  cluesContainer: {
    height: H - H70 - H6 - H5,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  cluesRow: { flexDirection: "row", width: "100%" },
  cluesColumn: { flex: 1, paddingHorizontal: 4 },
  cluesHeader: { fontSize: 9, fontWeight: 700, color: "#333", marginBottom: 2 },
  clueItem: { fontSize: 7.5, color: "#555", marginBottom: 1, lineHeight: 1.3 },
  footerText: { fontSize: 9, color: "#999", textAlign: "center" },
});

interface CrosswordPDFProps {
  data: CrosswordOutput;
  config: CrosswordConfig;
}

function CrosswordGrid({ data, showSolution }: { data: CrosswordOutput; showSolution: boolean }) {
  const size = data.width;
  const cellPx = calcCell(size);

  const acrossClues = data.clues.filter((c) => c.direction === "across");
  const downClues = data.clues.filter((c) => c.direction === "down");

  return (
    <View>
      <View style={styles.grid}>
        {Array.from({ length: size }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: size }, (_, c) => {
              const isBlock = data.blocks[r][c];
              const letter = showSolution ? data.grid[r][c] : "";
              const num = data.numbers[r][c];

              return (
                <View
                  key={c}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    backgroundColor: isBlock ? "#111827" : "#FFFFFF",
                    borderWidth: isBlock ? 0 : 0.5,
                    borderColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {!isBlock && letter ? (
                    <Text style={{ fontSize: cellPx * 0.45, fontWeight: 700, color: "#222" }}>
                      {letter}
                    </Text>
                  ) : null}
                  {!isBlock && num ? (
                    <Text
                      style={{
                        position: "absolute",
                        top: 1,
                        left: 2,
                        fontSize: Math.max(cellPx * 0.25, 7),
                        color: "#888",
                      }}
                    >
                      {num}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.cluesContainer}>
        <View style={styles.cluesRow}>
          {acrossClues.length > 0 && (
            <View style={styles.cluesColumn}>
              <Text style={styles.cluesHeader}>Horizontales:</Text>
              {acrossClues.map((clue) => (
                <Text key={clue.number} style={styles.clueItem}>
                  {clue.number}. {clue.clue}
                </Text>
              ))}
            </View>
          )}
          {downClues.length > 0 && (
            <View style={styles.cluesColumn}>
              <Text style={styles.cluesHeader}>Verticales:</Text>
              {downClues.map((clue) => (
                <Text key={clue.number} style={styles.clueItem}>
                  {clue.number}. {clue.clue}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CrosswordPDF({ data, config }: CrosswordPDFProps) {
  const size = data.width;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Crucigrama</Text>
        <Text style={styles.subtitle}>
          {size}x{size} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Resuelve el crucigrama escribiendo las palabras correctas en las casillas blancas.
        </Text>
      </View>

      <View style={styles.body}>
        <CrosswordGrid data={data} showSolution={false} />
      </View>
    </View>
  );
}

export function SolutionPDF({ data, config }: CrosswordPDFProps) {
  const size = data.width;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Crucigrama — Solucion</Text>
        <Text style={styles.subtitle}>
          {size}x{size} · {LABEL[config.difficulty] ?? "Facil"}
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Solucion del crucigrama con todas las palabras completadas.
        </Text>
      </View>

      <View style={styles.body}>
        <CrosswordGrid data={data} showSolution={true} />
      </View>
    </View>
  );
}
