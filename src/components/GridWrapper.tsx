import type { ReactNode } from "react";

interface Props {
  widthPx: number;
  heightPx: number;
  cols: number;
  rows: number;
  children: ReactNode;
}

const GridWrapper = ({ widthPx, heightPx, cols, rows, children }: Props) => {
  return (
    <div
      key={`${cols}-${rows}-grid`}
      className="bg-primary-foreground grid border"
      style={{
        width: `${widthPx + 2}px`,
        height: `${heightPx + 2}px`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
};

export default GridWrapper;
