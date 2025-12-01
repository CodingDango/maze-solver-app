import { Button } from "./components/ui/button";
import { useMaze } from "./hooks/useMaze";
import { isCellSamePos } from "./utils/maze";
import { useState } from "react";
import { CircleStop } from "lucide-react";
import type { MazeConfig } from "./types/maze";
import GridCell from "./components/GridCell";
import CONFIG from "./config.json";
import GridWrapper from "./components/GridWrapper";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function App() {
  const [mazeConfig, setMazeConfig] = useState<MazeConfig>(() => ({
    ROWS: CONFIG.ROWS,
    COLS: CONFIG.COLS,
    CELL_SIZE: CONFIG.CELL_SIZE,
    START_POS: CONFIG.START_POS,
  }));

  const {
    playerPos,
    pathAsSet,
    isSolving,
    isShowingPath,
    mazeWidth,
    mazeHeight,
    cellsToDisplay,
    solveMaze,
    handleResetMaze,
    handleStopMaze,
  } = useMaze(mazeConfig);

  const handleChangePresets = (preset: string) => {
    switch (preset) {
      case "small":
        setMazeConfig((prev) => ({
          ...prev,
          ROWS: 10,
          COLS: 10,
          CELL_SIZE: 60,
        }));
        break;
      case "medium":
        setMazeConfig((prev) => ({
          ...prev,
          ROWS: 15,
          COLS: 15,
          CELL_SIZE: 40,
        }));
        break;
      case "large":
        setMazeConfig((prev) => ({
          ...prev,
          ROWS: 20,
          COLS: 20,
          CELL_SIZE: 30,
        }));
        break;
    }
  };

  return (
    <div className="min-h-dvh bg-background dark flex justify-center items-center text-primary dark">
      <main className="flex flex-col gap-8 items-center">
        <div className="flex gap-4 justify-between w-full ">
          <div className="flex gap-4">
            <Button disabled={isSolving || undefined} onClick={solveMaze}>
              Solve Maze
            </Button>
            <Button variant={"outline"} onClick={handleResetMaze}>
              Reset Maze
            </Button>
            <Button
              disabled={!isSolving || undefined}
              variant={"destructive"}
              size={"icon"}
              onClick={handleStopMaze}
            >
              <CircleStop className="size-5 text-white" />
            </Button>
          </div>

          <Select onValueChange={(value) => handleChangePresets(value)} defaultValue="medium" disabled={isSolving}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small" >Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <GridWrapper
          widthPx={mazeWidth}
          heightPx={mazeHeight}
          cols={mazeConfig.COLS}
          rows={mazeConfig.ROWS}
        >
          {cellsToDisplay.map((cell) => {
            const isCellPlayer = isCellSamePos(cell, playerPos);
            const isCellInPath = pathAsSet.has(`${cell.col},${cell.row}`);

            return (
              <GridCell
                key={`${cell.row} ${cell.col}`}
                cellData={cell}
                isPlayer={isCellPlayer}
                isInPath={isCellInPath}
                isShowingPath={isShowingPath}
                isSolving={isSolving}
              />
            );
          })}
        </GridWrapper>
      </main>
    </div>
  );
}

export default App;
