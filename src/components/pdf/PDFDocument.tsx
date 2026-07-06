import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import type { ReactNode } from "react";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
  },
});

interface PDFDocumentProps {
  children: ReactNode;
}

export function GamePDFDocument({ children }: PDFDocumentProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {children}
      </Page>
    </Document>
  );
}
