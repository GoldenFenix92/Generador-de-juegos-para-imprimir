import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import { getGameDefinition, getPDFComponent } from "../lib/gameRegistry";
import type { GameId } from "../lib/gameRegistry";
import { Button } from "../components/ui/Button";
import { downloadPDF, printPDF } from "../lib/print";
import { GamePDFDocument } from "../components/pdf/PDFDocument";
import { useGeneratorStore } from "../store/generator";

const GAME_LABELS: Record<string, string> = {
  wordsearch: "Sopa de Letras",
  sudoku: "Sudoku",
  maze: "Laberinto",
  tictactoe: "Tres en Raya",
};

const pdfStyles = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica" },
});

export default function PrintPreview() {
  const navigate = useNavigate();
  const { game: gameParam } = useParams<{ game: string }>();
  const gameId = gameParam as GameId;
  const definition = getGameDefinition(gameId);
  const label = GAME_LABELS[gameId] ?? "Juego";
  const stored = useGeneratorStore((s) => s.data[gameId]);

  const [PDFComponent, setPDFComponent] = useState<React.FC<any> | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getPDFComponent(gameId).then((mod) => setPDFComponent(() => mod.default));
  }, [gameId]);

  const rawData = stored?.output ?? null;
  const config = stored?.config ?? definition?.defaultConfig;

  const dataArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
  const totalPages = dataArray.length;
  const currentData = dataArray[page] ?? null;

  function buildDoc() {
    if (!config || !PDFComponent) return null;
    if (dataArray.length > 1) {
      return (
        <Document>
          {dataArray.map((d, i) => (
            <Page key={i} size="LETTER" style={pdfStyles.page}>
              <PDFComponent data={d} config={config} />
            </Page>
          ))}
        </Document>
      );
    }
    if (currentData) {
      return (
        <GamePDFDocument>
          <PDFComponent data={currentData} config={config} />
        </GamePDFDocument>
      );
    }
    return null;
  }

  const [printError, setPrintError] = useState<string | null>(null);

  async function handleDownload() {
    setPrintError(null);
    const doc = buildDoc();
    if (!doc) return;
    try {
      await downloadPDF(doc, `${gameId}.pdf`);
    } catch {
      setPrintError("Error al generar el PDF. Intenta de nuevo.");
    }
  }

  async function handlePrint() {
    setPrintError(null);
    const doc = buildDoc();
    if (!doc) return;
    try {
      await printPDF(doc);
    } catch {
      setPrintError("Error al generar el PDF para impresion. Intenta de nuevo.");
    }
  }

  if (!definition) {
    return (
      <div>
        <Button
          variant="tertiary"
          slideIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
          onClick={() => navigate("/")}
        >
          Volver
        </Button>
        <h1 className="mb-6 text-2xl font-bold text-primary">Juego no encontrado</h1>
        <p className="text-muted">El juego solicitado no esta disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="tertiary"
        className="mb-4"
        slideIcon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        }
        onClick={() => navigate(`/generator/${gameId}`)}
      >
        Volver
      </Button>
      <h1 className="mb-6 text-2xl font-bold text-primary">Vista previa - {label}</h1>

      <div className="glass-card mb-6 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Button
          variant="primary"
          className="w-full sm:w-auto"
          slideIcon={
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-7a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2z" />
            </svg>
          }
          onClick={handleDownload}
          disabled={!PDFComponent}
        >
          Descargar PDF
        </Button>
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          slideIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          }
          onClick={handlePrint}
          disabled={!PDFComponent}
        >
          Imprimir
        </Button>
      </div>

      {printError && (
        <p className="mb-4 text-sm font-medium" style={{ color: "#EC4899" }}>
          {printError}
        </p>
      )} 

      {totalPages > 1 && (
        <div className="glass-card mb-4 p-3 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-30 hover:bg-white/10"
            style={{ color: "var(--text-primary)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Sopa {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-30 hover:bg-white/10"
            style={{ color: "var(--text-primary)" }}
          >
            Siguiente
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {currentData && config && <definition.Preview data={currentData as any} config={config as any} />}
    </div>
  );
}
