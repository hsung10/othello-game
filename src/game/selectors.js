import { BLACK, DRAW, EMPTY, WHITE } from './constants.js';
import { getValidMoves } from './rules.js';

export function countDiscs(board) {
  return board.flat().reduce(
    (scores, cell) => {
      if (cell === BLACK) {
        scores.black += 1;
      } else if (cell === WHITE) {
        scores.white += 1;
      } else if (cell === EMPTY) {
        scores.empty += 1;
      }

      return scores;
    },
    { black: 0, white: 0, empty: 0 },
  );
}

export function isGameOver(board) {
  const scores = countDiscs(board);

  if (scores.empty === 0) {
    return true;
  }

  return (
    getValidMoves(board, BLACK).length === 0 &&
    getValidMoves(board, WHITE).length === 0
  );
}

export function getWinner(board) {
  const scores = countDiscs(board);

  if (scores.black > scores.white) {
    return BLACK;
  }

  if (scores.white > scores.black) {
    return WHITE;
  }

  return DRAW;
}

export function selectValidMoves(board, player) {
  return getValidMoves(board, player);
}

export function getCoordinateKey(row, col) {
  return `${row}-${col}`;
}

export function createValidMoveKeySet(validMoves) {
  return new Set(validMoves.map(({ row, col }) => getCoordinateKey(row, col)));
}
