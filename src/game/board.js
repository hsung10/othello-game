import { BLACK, BOARD_SIZE, EMPTY, WHITE } from './constants.js';

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => EMPTY),
  );
}

export function createInitialBoard() {
  const board = createEmptyBoard();
  const upperCenter = BOARD_SIZE / 2 - 1;
  const lowerCenter = BOARD_SIZE / 2;

  board[upperCenter][upperCenter] = WHITE;
  board[upperCenter][lowerCenter] = BLACK;
  board[lowerCenter][upperCenter] = BLACK;
  board[lowerCenter][lowerCenter] = WHITE;

  return board;
}

export function isWithinBoard(row, col) {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < BOARD_SIZE &&
    col >= 0 &&
    col < BOARD_SIZE
  );
}
