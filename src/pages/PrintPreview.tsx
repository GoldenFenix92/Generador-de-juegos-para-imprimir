import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function PrintPreview() {
  const navigate = useNavigate();
  const { game: gameParam } = useParams<{ game: string }>();
  const gameId = gameParam as GameId;
  const definition = getGameDefinition(gameId);
  const label = GAME_LABELS[gameId] ?? "Juego";
  const stored = useGeneratorStore((s) => s.data[gameId]);

  const [PDFComponent, setPDFComponent] = useState<React.FC<any> | null>(null);

  useEffect(() => {
    getPDFComponent(gameId).then((mod) => setPDFComponent(() => mod.default));
  }, [gameId]);

  const data = stored?.output ?? null;
  const config = stored?.config ?? definition?.defaultConfig;

  function buildDoc() {
    if (!data || !config || !PDFComponent) return null;
    return (
      <GamePDFDocument>
        <PDFComponent data={data} config={config} />
      </GamePDFDocument>
    );
  }

  async function handleDownload() {
    const doc = buildDoc();
    if (!doc) return;
    await downloadPDF(doc, `${gameId}.pdf`);
  }

  async function handlePrint() {
    const doc = buildDoc();
    if (!doc) return;
    await printPDF(doc);
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

      <div className="glass-card mb-6 p-4 flex gap-3 w-fit">
        <Button
          variant="primary"
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

      {data && config && <definition.Preview data={data as any} config={config as any} />}
    </div>
  );
}
