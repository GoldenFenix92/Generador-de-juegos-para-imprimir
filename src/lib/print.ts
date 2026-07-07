import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

async function buildBlob(doc: ReactElement): Promise<Blob> {
  return await (pdf as any)(doc).toBlob();
}

export async function downloadPDF(doc: ReactElement, filename: string) {
  const blob = await buildBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function printPDF(doc: ReactElement) {
  const blob = await buildBlob(doc);
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
