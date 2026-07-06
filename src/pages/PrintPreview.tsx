import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
        <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          &larr; Volver
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Juego no encontrado</h1>
        <p className="text-gray-600">El juego solicitado no está disponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/generator/${gameId}`} className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        &larr; Volver
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Vista previa - {label}</h1>

      <div className="mb-6 flex gap-3">
        <Button onClick={handleDownload} disabled={!PDFComponent}>Descargar PDF</Button>
        <Button onClick={handlePrint} disabled={!PDFComponent}>Imprimir</Button>
      </div>

      {data && config && <definition.Preview data={data as any} config={config as any} />}
    </div>
  );
}
