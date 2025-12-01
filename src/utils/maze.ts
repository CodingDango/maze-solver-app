import { sample } from "lodash";
import type { Cell, MazeConfig, Position } from "@/types/maze";

export const createGridCell = (row: number, col: number): Cell => ({
  row,
  col,
  isTarget: false,
  visited: false,
  walls: {
    top: true,
    right: true,
    bottom: true,
    left: true
  }
});

export const setupGrid = (rows: number, cols: number): Cell[][] => {
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const currentRow = [];

    for (let c = 0; c < cols; c++) {
      const gridCell = createGridCell(r, c);
      currentRow.push(gridCell);
    }

    grid.push(currentRow);
  }

  return grid;
};

export const getUnvisitedNeighbors = (cell: Cell, grid: Cell[][], mazeConfig: MazeConfig): Cell[] => {
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
      newCol > -1 &&
      newCol < mazeConfig.COLS &&
      newRow > -1 &&
      newRow < mazeConfig.ROWS;

    if (isValidOffset) {
      const neighborCell = grid[newRow][newCol];

      if (!neighborCell.visited) {
        neighbors.push(neighborCell);
      }
    }
  }

  return neighbors;
};

export const removeWalls = (current: Cell, next: Cell) => {
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

export const setupMaze = (mazeConfig: MazeConfig): Cell[][] => {
  const grid = setupGrid(mazeConfig.ROWS, mazeConfig.COLS);
  const { row: startingRow, col: startingCol } = mazeConfig.START_POS;

  const startingCell = grid[startingRow][startingCol];
  startingCell.visited = true;
  const stack = [startingCell];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid, mazeConfig);

    if (neighbors.length > 0) {
      const randomNeighbor = sample(neighbors)!;
      removeWalls(current, randomNeighbor);
      randomNeighbor.visited = true;
      stack.push(randomNeighbor);
    } else {
      stack.pop();
    }
  }

  // Plant the target flag
  grid[mazeConfig.ROWS - 1][mazeConfig.COLS - 1].isTarget = true;
  return grid;
};

export const isCellSamePos = (cellA: Position, cellB: Position) => {
  return cellA.col === cellB.col && cellA.row === cellB.row;
}