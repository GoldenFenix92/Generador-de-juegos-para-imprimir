import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import { getGameDefinition, getPDFComponent } from "../lib/gameRegistry";
import type { GameId, PDFModule } from "../lib/gameRegistry";
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

  const [pdfModule, setPDFModule] = useState<PDFModule<any, any> | null>(null);

  useEffect(() => {
    getPDFComponent(gameId).then((mod) => setPDFModule(mod));
  }, [gameId]);

  const rawData = stored?.output ?? null;
  const config = stored?.config ?? definition?.defaultConfig;

  const dataArray: any[] = useMemo(
    () => (Array.isArray(rawData) ? rawData : rawData ? [rawData] : []),
    [rawData],
  );

  const [page, setPage] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (page >= dataArray.length && dataArray.length > 0) {
      setPage(0);
    }
  }, [page, dataArray.length]);

  const totalPages = dataArray.length;
  const currentData = dataArray[page] ?? null;

  const PreviewComp = definition?.Preview;

  function buildDoc() {
    if (!config || !pdfModule?.default) return null;


    // Collect all PDF pages: puzzle pages + optional solution pages
    const pdfPages: { Component: React.FC<any>; data: any }[] = [];

    for (const d of dataArray) {
      pdfPages.push({ Component: pdfModule.default, data: d });
      if (showSolution && pdfModule.SolutionPDF) {
        pdfPages.push({ Component: pdfModule.SolutionPDF, data: d });
      }
    }

    if (pdfPages.length > 1) {
      return (
        <Document>
          {pdfPages.map((p, i) => (
            <Page key={i} size="LETTER" style={pdfStyles.page}>
              <p.Component data={p.data} config={config} />
            </Page>
          ))}
        </Document>
      );
    }

    if (pdfPages.length === 1) {
      const SingleComp = pdfPages[0].Component;
      const singleData = pdfPages[0].data;
      return (
        <GamePDFDocument>
          <SingleComp data={singleData} config={config} />
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

      <div className="glass-card mb-6 p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        {gameId !== "tictactoe" && (
          <label className="flex items-center gap-2 cursor-pointer select-none order-first sm:order-none w-full sm:w-auto">
            <input
              type="checkbox"
              checked={showSolution}
              onChange={(e) => setShowSolution(e.target.checked)}
              className="h-4 w-4 rounded accent-purple-600"
            />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Incluir solucion en PDF
            </span>
          </label>
        )}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            slideIcon={
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-7a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2z" />
              </svg>
            }
            onClick={handleDownload}
            disabled={!pdfModule?.default}
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
            disabled={!pdfModule?.default}
          >
            Imprimir
          </Button>
        </div>
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
            Pagina {page + 1} de {totalPages}
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

      {currentData && config && PreviewComp && (
        <PreviewComp data={currentData} config={config} />
      )}
    </div>
  );
}
