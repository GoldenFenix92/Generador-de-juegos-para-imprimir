import { View, StyleSheet } from "@react-pdf/renderer";
import type { MazeConfig, MazeOutput } from "./types";

const styles = StyleSheet.create({
  grid: { flexDirection: "column", alignItems: "center" },
  row: { flexDirection: "row" },
  cellWall: { width: 8, height: 8, backgroundColor: "#000" },
  cellOpen: { width: 8, height: 8, backgroundColor: "#fff" },
});

interface MazePDFProps {
  data: MazeOutput;
  config: MazeConfig;
}

export default function MazePDF({ data }: MazePDFProps) {
  const { walls } = data;

  return (
    <View style={styles.grid}>
      {walls.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((isWall, c) => (
            <View key={c} style={isWall ? styles.cellWall : styles.cellOpen} />
          ))}
        </View>
      ))}
    </View>
  );
}
