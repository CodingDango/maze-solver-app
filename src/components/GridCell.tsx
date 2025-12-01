import { cn } from "@/lib/utils";
import type { Cell, Direction } from "@/types/maze";
import CONFIG from '../config.json' with { type: 'json' };

interface Props {
  cellData: Cell;
  isPlayer: boolean;
  isInPath: boolean;
  isShowingPath: boolean;
  isSolving: boolean;
  playerDirection: Direction;
};

function GridCell({ cellData, isPlayer, isInPath, isShowingPath, isSolving, playerDirection }: Props) {
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
      "flex justify-center items-center bg-neutral-900 border-neutral-600 p-2",
      cellData.walls.top ? "border-t" : "",
      cellData.walls.right ? "border-r" : "",
      cellData.walls.bottom ? "border-b" : "",
      cellData.walls.left ? "border-l" : ""
    )}
  >
    {isPlayer && !cellData.isTarget ? (
      // RENDER THE TRIANGLE for the player
      <div className={cn(
        'w-full h-full bg-blue-400 [clip-path:polygon(50%_0%,_15%_100%,_85%_100%)]',
        playerDirection === 'right' ? 'rotate-90' : '',
        playerDirection === 'bottom' ? 'rotate-180' : '',
        playerDirection === 'left' ? 'rotate-270' : '',
      )}
      />
    ) : (
      // RENDER THE ORIGINAL DIV for everything else
      <div className={cn(
        'w-full h-full',
        markerColor ? `${markerColor}` : '',
        isInPath && !isPlayer ? 'max-w-[30%] max-h-[30%] rounded-xs' : '',
        cellData.isTarget ? 'rounded-md' : ''
      )}></div>
    )}
  </div>
);
}

export default GridCell;
