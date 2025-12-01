export interface Position {
  col: number,
  row: number
};

export interface Cell extends Position {
  isTarget: boolean;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  }
}

export interface MazeConfig {
  ROWS: number;
  COLS: number;
  CELL_SIZE: number;
  START_POS: Position;
}

export type Direction = 'top' | 'right' | 'bottom' | 'left';