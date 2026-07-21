import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CrosswordConfig, CrosswordOutput } from "./types";

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
  return Math.floor(Math.min(W / g, H80 / g) * 0.9);
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
  grid: {
    flexDirection: "column",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  footer: {
    height: H - H80 - H6 - H5,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  cluesRow: { flexDirection: "row", width: "100%" },
  cluesColumn: { flex: 1, paddingHorizontal: 6 },
  cluesHeader: { fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 3 },
  clueItem: { fontSize: 9, color: "#444", marginBottom: 2, lineHeight: 1.5 },
});

interface CrosswordPDFProps {
  data: CrosswordOutput;
  config: CrosswordConfig;
}

function CrosswordGrid({ data, showSolution }: { data: CrosswordOutput; showSolution: boolean }) {
  const size = data.width;
  const cellPx = calcCell(size);

  return (
    <View>
      <View style={styles.grid}>
        {Array.from({ length: size }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: size }, (_, c) => {
              const letter = data.grid[r][c];
              const hasLetter = letter !== "";
              const showLetter = showSolution && hasLetter;

              return (
                <View
                  key={c}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    backgroundColor: hasLetter ? "#FFFFFF" : "transparent",
                    borderStyle: "solid",
                    borderTopWidth: hasLetter ? 1.5 : 0,
                    borderTopColor: "#e0e0e0",
                    borderLeftWidth: hasLetter ? 1.5 : 0,
                    borderLeftColor: "#e0e0e0",
                    borderRightWidth: hasLetter ? 2 : 0,
                    borderRightColor: "#888888",
                    borderBottomWidth: hasLetter ? 2 : 0,
                    borderBottomColor: "#888888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {hasLetter && showLetter ? (
                    <Text style={{ fontSize: cellPx * 0.45, fontWeight: 700, color: "#222" }}>
                      {letter}
                    </Text>
                  ) : null}
                  {hasLetter && data.numbers[r][c] ? (
                    <Text
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 3,
                        fontSize: Math.max(cellPx * 0.25, 8),
                        color: "#000",
                        fontFamily: "Helvetica",
                        fontWeight: 700,
                      }}
                    >
                      {data.numbers[r][c]}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

interface CrosswordCluesProps {
  data: CrosswordOutput;
}

function CrosswordClues({ data }: CrosswordCluesProps) {
  const acrossClues = data.clues.filter((c) => c.direction === "across");
  const downClues = data.clues.filter((c) => c.direction === "down");

  return (
    <View style={styles.footer}>
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
  );
}

export default function CrosswordPDF({ data, config }: CrosswordPDFProps) {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Crucigrama</Text>
        <Text style={styles.subtitle}>
          {config.generationMode === "themed" && config.theme
            ? `Tematica: ${config.theme} · `
            : config.generationMode === "custom"
              ? "Personalizado · "
              : ""}
          Dificultad: {LABEL[config.difficulty] ?? "Facil"} · {data.placedWords.length} palabras
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Resuelve el crucigrama escribiendo las palabras correctas en las casillas en blanco.
        </Text>
      </View>

      <View style={styles.body}>
        <View style={{ paddingTop: Math.floor(H * 0.03) }}>
          <CrosswordGrid data={data} showSolution={false} />
        </View>
      </View>
      <CrosswordClues data={data} />
    </View>
  );
}

export function SolutionPDF({ data, config }: CrosswordPDFProps) {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Crucigrama — Solucion</Text>
        <Text style={styles.subtitle}>
          {config.generationMode === "themed" && config.theme
            ? `Tematica: ${config.theme} · `
            : config.generationMode === "custom"
              ? "Personalizado · "
              : ""}
          Dificultad: {LABEL[config.difficulty] ?? "Facil"} · {data.placedWords.length} palabras
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instrText}>
          Solucion del crucigrama con todas las palabras completadas.
        </Text>
      </View>

      <View style={styles.body}>
        <View style={{ paddingTop: Math.floor(H * 0.03) }}>
          <CrosswordGrid data={data} showSolution={true} />
        </View>
      </View>
      <CrosswordClues data={data} />
    </View>
  );
}
