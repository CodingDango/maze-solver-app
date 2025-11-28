import { useState, useMemo, useRef } from "react";
import { sample } from "lodash";
import GridCell from "./components/GridCell";
import { Button } from "./components/ui/button";

const GRID_CELL_SIZE = 40;
const GRID_ROWS = 15;
const GRID_COLS = 15;
const GRID_WIDTH = GRID_COLS * GRID_CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * GRID_CELL_SIZE;
const STARTING_POS = {
  col: 0,
  row: 0,
};

const PLAYER_MARKER_COLOR = "bg-blue-400";
const PLAYER_PATH_MARKER_COLOR = "bg-blue-400";
const PATH_MARKER_COLOR = "bg-green-400";
const TARGET_MARKER_COLOR = "bg-red-400";

const createGridCell = (
  row = 0,
  col = 0,
  walls = {
    top: false,
    right: false,
    bottom: false,
    left: false,
  }
) => ({
  row,
  col,
  walls,
  isTarget: false,
  visited: false,
});

const setupGrid = (rows, cols) => {
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const currentRow = [];

    for (let c = 0; c < cols; c++) {
      const gridCell = createGridCell(r, c, {
        top: true,
        right: true,
        bottom: true,
        left: true,
      });

      currentRow.push(gridCell);
    }

    grid.push(currentRow);
  }

  return grid;
};

const getUnvisitedNeighbors = (cell, grid) => {
  const neighbors = [];
  const offsets = [
    [0, -1], // top +0 for column, -1 for row
    [1, 0], // right
    [0, 1], // bottom
    [-1, 0], // left
  ];

  for (const [colOffset, rowOffset] of offsets) {
    const newCol = colOffset + cell.col;
    const newRow = rowOffset + cell.row;
    const isValidOffset =
      newCol > -1 && newCol < GRID_COLS && newRow > -1 && newRow < GRID_ROWS;

    if (isValidOffset) {
      const neighborCell = grid[newRow][newCol];

      if (!neighborCell.visited) {
        neighbors.push(neighborCell);
      }
    }
  }

  return neighbors;
};

const removeWalls = (current, next) => {
  const dx = current.col - next.col;
  const dy = current.row - next.row;

  // If next is to the RIGHT of current (col + 1)
  if (dx === -1) {
    current.walls.right = false;
    next.walls.left = false;
  }
  // If next is to the LEFT of current (col - 1)
  else if (dx === 1) {
    current.walls.left = false;
    next.walls.right = false;
  }

  // If next is BELOW current (row + 1)
  if (dy === -1) {
    current.walls.bottom = false;
    next.walls.top = false;
  }
  // If next is ABOVE current (row - 1)
  else if (dy === 1) {
    current.walls.top = false;
    next.walls.bottom = false;
  }
};

const setupMaze = () => {
  const grid = setupGrid(GRID_ROWS, GRID_COLS);
  const { row: startingRow, col: startingCol } = STARTING_POS;

  const startingCell = grid[startingRow][startingCol];
  startingCell.visited = true;
  const stack = [startingCell];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid);

    if (neighbors.length > 0) {
      const randomNeighbor = sample(neighbors);
      removeWalls(current, randomNeighbor);
      randomNeighbor.visited = true;
      stack.push(randomNeighbor);
    } else {
      stack.pop();
    }
  }

  // Plant the flag
  grid[GRID_ROWS - 1][GRID_COLS - 1].isTarget = true;

  return grid;
};

function App() {
  const [maze, setMaze] = useState(() => setupMaze());
  const [playerPos, setPlayerPos] = useState(STARTING_POS);
  const [path, setPath] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [isShowingPath, setIsShowingPath] = useState(false);
  const abortRef = useRef(false);

  const cellsToDisplay = useMemo(() => {
    const cells = [];

    maze.forEach((row) => {
      row.forEach((col) => {
        cells.push(col);
      });
    });

    return cells;
  }, [maze]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const solveMaze = async () => {
    abortRef.current = false;
    
    if (isSolving) return;

    setPath([]);
    setIsShowingPath(false);
    setPlayerPos(STARTING_POS);
    setIsSolving(true);

    // oaky, we use a set beacuse i dont know.
    const visited = new Set();

    // here is our stack, the last element is always the current cell that we are on,
    // now i understand i think.
    const stack = [STARTING_POS];

    // add this thing to our set because... we dont want visited to be empty.
    visited.add(`${STARTING_POS.row},${STARTING_POS.col}`);

    while (stack.length > 0) {
      const currentPos = stack[stack.length - 1];
      const { row, col } = currentPos;
      const currentCell = maze[row][col];

      if (abortRef.current) {
        setIsSolving(false);
        setPath([]);
        return;
      }

      // update the state to where we are right now=
      setPlayerPos({ row, col });

      // check if we are on the uh, target so that we break out the loop.
      if (currentCell.isTarget) {
        console.log("WINNER!");
        break;
      }

      await sleep(50);

      const potentialMoves = [];

      if (!currentCell.walls.top) {
        const nextRow = row - 1;
        if (!visited.has(`${nextRow},${col}`)) {
          // Have we been there?
          potentialMoves.push({ row: nextRow, col: col });
        }
      }
      // Check Right
      if (!currentCell.walls.right) {
        const nextCol = col + 1;
        if (!visited.has(`${row},${nextCol}`)) {
          potentialMoves.push({ row: row, col: nextCol });
        }
      }
      // Check Bottom
      if (!currentCell.walls.bottom) {
        const nextRow = row + 1;
        if (!visited.has(`${nextRow},${col}`)) {
          potentialMoves.push({ row: nextRow, col: col });
        }
      }
      // Check Left
      if (!currentCell.walls.left) {
        const nextCol = col - 1;
        if (!visited.has(`${row},${nextCol}`)) {
          potentialMoves.push({ row: row, col: nextCol });
        }
      }

      if (potentialMoves.length > 0) {
        const nextMove = potentialMoves[0];

        visited.add(`${nextMove.row},${nextMove.col}`);
        stack.push(nextMove);
      } else {
        stack.pop();
      }

      setPath(stack);
    }

    setPath([]);

    if (!abortRef.current) {
      await showPath(stack);
    }

    setIsSolving(false);
  };

  const handleResetMaze = () => {
    abortRef.current = true;
    setIsSolving(false);
    setPath([]);

    const newMaze = setupMaze();
    setMaze(newMaze);
    setPlayerPos({ col: 0, row: 0 });
  };

  const showPath = async (path) => {
    setIsShowingPath(true);

    for (const pathCell of path) {
      if (abortRef.current) return;
      setPath((prev) => [...prev, pathCell]);
      await sleep(50);
    }
  };

  return (
    <div className="min-h-dvh bg-background dark flex justify-center items-center text-primary">
      <main className="flex flex-col gap-4 items-center">
        <div className="flex gap-4">
          <Button disabled={isSolving || undefined} onClick={solveMaze}>
            Solve Maze
          </Button>
          <Button variant={"outline"} onClick={handleResetMaze}>
            Reset Maze
          </Button>
        </div>
        <div
          className="bg-primary-foreground grid border"
          style={{
            width: `${GRID_WIDTH + 2}px`,
            height: `${GRID_HEIGHT + 2}px`,
            gridTemplateColumns: `${"1fr ".repeat(GRID_COLS)}`,
            gridTemplateRows: `${"1fr ".repeat(GRID_ROWS)}`,
          }}
        >
          {cellsToDisplay.map((cell, idx) => {
            const isCellPlayer =
              cell.col === playerPos.col && cell.row === playerPos.row;
            const isCellTarget = cell.isTarget;
            const pathCellIdx = path.findIndex(
              (pathCell) =>
                pathCell.col === cell.col && pathCell.row === cell.row
            );
            const isCellInPath = pathCellIdx !== -1;

            let markerColor = null;
            let markerClass = null;

            if (isCellPlayer && !isCellTarget) {
              markerColor = PLAYER_MARKER_COLOR;
            } else if (isCellTarget && !isCellPlayer) {
              markerColor = TARGET_MARKER_COLOR;
            } else if (isCellInPath && isShowingPath) {
              markerColor = PATH_MARKER_COLOR;
            } else if (isCellInPath && isSolving) {
              markerColor = PLAYER_PATH_MARKER_COLOR;
            }

            if (isCellInPath && !isCellPlayer && !isCellTarget) {
              markerClass = "max-w-[40%] max-h-[40%] rounded-xs";
            }

            // get current path cell, before, and after it.
            // then edit the borders, override padding of either bottom, left, right, or top so that the blocks are continuous

            return (
              <GridCell
                key={`${cell.row} ${cell.col}`}
                walls={cell.walls}
                markerColor={markerColor}
                markerClass={markerClass}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
