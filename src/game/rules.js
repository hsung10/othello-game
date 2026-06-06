import { BLACK, DIRECTIONS, EMPTY, WHITE } from './constants.js';
import { isWithinBoard } from './board.js';

export function getOpponent(player) {
  if (player === BLACK) {
    return WHITE;
  }

  if (player === WHITE) {
    return BLACK;
  }

  throw new TypeError(`Unknown player: ${String(player)}`);
}

function getFlippableDiscsInDirection(
  board,
  row,
  col,
  player,
  rowOffset,
  colOffset,
) {
  const opponent = getOpponent(player);
  const discs = [];
  let nextRow = row + rowOffset;
  let nextCol = col + colOffset;

  while (
    isWithinBoard(nextRow, nextCol) &&
    board[nextRow][nextCol] === opponent
  ) {
    discs.push({ row: nextRow, col: nextCol });
    nextRow += rowOffset;
    nextCol += colOffset;
  }

  if (
    discs.length === 0 ||
    !isWithinBoard(nextRow, nextCol) ||
    board[nextRow][nextCol] !== player
  ) {
    return [];
  }

  return discs;
}

export function getFlippableDiscs(board, row, col, player) {
  if (!isWithinBoard(row, col) || board[row][col] !== EMPTY) {
    return [];
  }

  return DIRECTIONS.flatMap(({ row: rowOffset, col: colOffset }) =>
    getFlippableDiscsInDirection(board, row, col, player, rowOffset, colOffset),
  );
}

export function isValidMove(board, row, col, player) {
  return getFlippableDiscs(board, row, col, player).length > 0;
}

export function getValidMoves(board, player) {
  const validMoves = [];

  board.forEach((boardRow, row) => {
    boardRow.forEach((cell, col) => {
      if (cell === EMPTY && isValidMove(board, row, col, player)) {
        validMoves.push({ row, col });
      }
    });
  });

  return validMoves;
}

export function applyMove(board, row, col, player) {
  const flippableDiscs = getFlippableDiscs(board, row, col, player);

  if (flippableDiscs.length === 0) {
    return board;
  }

  const nextBoard = board.map((boardRow) => [...boardRow]);
  nextBoard[row][col] = player;

  flippableDiscs.forEach(({ row: discRow, col: discCol }) => {
    nextBoard[discRow][discCol] = player;
  });

  return nextBoard;
}
