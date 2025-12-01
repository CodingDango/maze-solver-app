import { useState, useMemo, useRef, useEffect } from "react";
import type { Position, Cell, MazeConfig } from "@/types/maze";
import { setupMaze } from "../utils/maze";
import clickSound from '@/assets/click.ogg';
import winSound from '@/assets/win.ogg';

export const useMaze = (mazeConfig: MazeConfig) => {
  const [maze, setMaze] = useState(() => setupMaze(mazeConfig));
  const [playerPos, setPlayerPos] = useState<Position>(mazeConfig.START_POS);
  const [path, setPath] = useState<Position[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [isShowingPath, setIsShowingPath] = useState(false);
  const abortRef = useRef(false);

  const mazeWidth = useMemo(
    () => mazeConfig.CELL_SIZE * mazeConfig.COLS,
    [mazeConfig]
  );
  const mazeHeight = useMemo(
    () => mazeConfig.CELL_SIZE * mazeConfig.ROWS,
    [mazeConfig]
  );

  const pathAsSet = useMemo(() => {
    return new Set(path.map((cell) => `${cell.col},${cell.row}`));
  }, [path]);

  const cellsToDisplay = useMemo(() => {
    const cells: Cell[] = [];

    maze.forEach((row) => {
      row.forEach((col) => {
        cells.push(col);
      });
    });

    return cells;
  }, [maze]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const solveMaze = async () => {
    abortRef.current = false;

    if (isSolving) return;

    setPath([]);
    setIsShowingPath(false);
    setPlayerPos(mazeConfig.START_POS);
    setIsSolving(true);

    // alright, we use a set because i don't' know.
    const visited = new Set();

    // here is our stack, the last element is always the current cell that we are on,
    // now i understand i think.
    const stack = [mazeConfig.START_POS];

    // add this thing to our set because... we don't want visited to be empty.
    visited.add(`${mazeConfig.START_POS.row},${mazeConfig.START_POS.col}`);

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
        (new Audio(winSound)).play();
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

      (new Audio(clickSound)).play();
      setPath([...stack]);
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

    const newMaze = setupMaze(mazeConfig);
    setMaze(newMaze);
    setPlayerPos({ col: 0, row: 0 });
  };

  const handleStopMaze = () => {
    abortRef.current = true;
    setIsSolving(false);
    setPath([]);
    setPlayerPos({ col: 0, row: 0 });
  };

  const showPath = async (path: Position[]) => {
    setIsShowingPath(true);

    for (const pathCell of path) {
      if (abortRef.current) return;
      setPath((prev) => [...prev, pathCell]);
      await sleep(25);
    }
  };

  useEffect(() => {
    handleStopMaze();
    setMaze(setupMaze(mazeConfig));
  }, [mazeConfig]);

  return {
    maze,
    setMaze,
    playerPos,
    setPlayerPos,
    path,
    pathAsSet,
    setPath,
    isSolving,
    setIsSolving,
    isShowingPath,
    setIsShowingPath,
    abortRef,
    mazeWidth,
    mazeHeight,
    cellsToDisplay,
    solveMaze,
    handleResetMaze,
    handleStopMaze,
    showPath,
  };
};
