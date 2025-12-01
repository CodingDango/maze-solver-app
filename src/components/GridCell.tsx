import { cn } from "@/lib/utils";
import type { Cell } from "@/types/maze";
import CONFIG from '../config.json' with { type: 'json' };

interface Props {
  cellData: Cell;
  isPlayer: boolean;
  isInPath: boolean;
  isShowingPath: boolean;
  isSolving: boolean;
};

function GridCell({ cellData, isPlayer, isInPath, isShowingPath, isSolving }: Props) {
  let markerColor: string | null = null;

  if (isPlayer && !cellData.isTarget) {
    markerColor = CONFIG.COLORS.PLAYER;
  } else if (cellData.isTarget && !isPlayer) {
    markerColor = CONFIG.COLORS.TARGET;
  } else if (isInPath && isShowingPath) {
    markerColor = CONFIG.COLORS.PATH;
  } else if (isInPath && isSolving) {
    markerColor = CONFIG.COLORS.PLAYER;
  }

  return (
    <div
      className={cn(
        "flex justify-center items-center bg-neutral-900 border-neutral-600",
        cellData.walls.top ? "border-t" : "",
        cellData.walls.right ? "border-r" : "",
        cellData.walls.bottom ? "border-b" : "",
        cellData.walls.left ? "border-l" : ""
      )}
    >
      <div className={cn(
        'w-full h-full',
        markerColor ? `${markerColor}` : '',
        isInPath && !isPlayer ? 'max-w-[20%] max-h-[20%] rounded-xs' : '',
        isPlayer || cellData.isTarget ? 'rounded-md max-w-[60%] max-h-[60%]' : ''
      )}></div>
    </div>
  );
}

export default GridCell;
