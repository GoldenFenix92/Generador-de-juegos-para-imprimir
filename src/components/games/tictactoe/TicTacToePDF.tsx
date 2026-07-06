import { View, StyleSheet } from "@react-pdf/renderer";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

const styles = StyleSheet.create({
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#000",
  },
});

interface TicTacToePDFProps {
  data: TicTacToeOutput;
  config: TicTacToeConfig;
}

export default function TicTacToePDF({ data }: TicTacToePDFProps) {
  const { grid } = data;

  return (
    <View style={styles.grid}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((_cell, c) => (
            <View key={c} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}
