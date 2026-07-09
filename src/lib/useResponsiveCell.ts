import { useState, useRef, useEffect } from "react";

const GRID_PAD = 16;

export function useResponsiveCell(cols: number, maxCell = 36, gapPx = 4) {
  const ref = useRef<HTMLDivElement>(null);
  const [cellPx, setCellPx] = useState(maxCell);

  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const avail = ref.current.clientWidth - GRID_PAD;
      const gaps = (cols - 1) * gapPx;
      const px = Math.floor((avail - gaps) / cols);
      setCellPx(Math.min(Math.max(px, 16), maxCell));
    }

    calc();
    const observer = new ResizeObserver(calc);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [cols, maxCell, gapPx]);

  return { ref, cellPx };
}

export function cellFontSize(cellPx: number): string {
  if (cellPx >= 32) return "0.875rem";
  if (cellPx >= 24) return "0.75rem";
  if (cellPx >= 18) return "0.7rem";
  return "0.625rem";
}
