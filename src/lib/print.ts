import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  document.body.appendChild(iframe);
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.print();
    } catch {
      window.open(url);
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
}
