import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { SudokuConfig, SudokuOutput } from "./types";

const styles = StyleSheet.create({
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  cell: {
    width: 28,
    height: 28,
    fontSize: 12,
    fontFamily: "Courier",
    textAlign: "center" as const,
    lineHeight: 28,
    borderWidth: 0.5,
    borderColor: "#999",
  },
  header: { fontSize: 14, marginBottom: 12, textAlign: "center" as const },
});

interface SudokuPDFProps {
  data: SudokuOutput;
  config: SudokuConfig;
}

export default function SudokuPDF({ data }: SudokuPDFProps) {
  const { puzzle } = data;

  return (
    <View>
      <Text style={styles.header}>Sudoku</Text>
      <View style={styles.grid}>
        {puzzle.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => {
              const rightThick = (c + 1) % 3 === 0 && c < 8;
              const bottomThick = (r + 1) % 3 === 0 && r < 8;
              const style = {
                ...styles.cell,
                ...(rightThick ? { borderRightWidth: 2, borderRightColor: "#000" } : {}),
                ...(bottomThick ? { borderBottomWidth: 2, borderBottomColor: "#000" } : {}),
              };
              return (
                <Text key={c} style={style}>
                  {cell !== 0 ? cell : ""}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
