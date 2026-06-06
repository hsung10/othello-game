import { describe, expect, it } from 'vitest';

import { BLACK, BOARD_SIZE, EMPTY, WHITE } from '../../src/game/constants.js';
import { createEmptyBoard, createInitialBoard } from '../../src/game/board.js';
import {
  applyMove,
  getFlippableDiscs,
  getOpponent,
  getValidMoves,
  isValidMove,
} from '../../src/game/rules.js';

describe('getOpponent', () => {
  it('returns the other player', () => {
    expect(getOpponent(BLACK)).toBe(WHITE);
    expect(getOpponent(WHITE)).toBe(BLACK);
  });

  it('rejects an unknown player', () => {
    expect(() => getOpponent('green')).toThrow(TypeError);
  });
});

describe('move rules', () => {
  it('finds the four standard opening moves for black', () => {
    expect(getValidMoves(createInitialBoard(), BLACK)).toEqual([
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 4 },
    ]);
  });

  it.each([
    ['north', -1, 0],
    ['north-east', -1, 1],
    ['east', 0, 1],
    ['south-east', 1, 1],
    ['south', 1, 0],
    ['south-west', 1, -1],
    ['west', 0, -1],
    ['north-west', -1, -1],
  ])('flips discs to the %s', (_name, rowOffset, colOffset) => {
    const board = createEmptyBoard();
    const row = 3;
    const col = 3;

    board[row + rowOffset][col + colOffset] = WHITE;
    board[row + rowOffset * 2][col + colOffset * 2] = BLACK;

    expect(getFlippableDiscs(board, row, col, BLACK)).toEqual([
      { row: row + rowOffset, col: col + colOffset },
    ]);

    const nextBoard = applyMove(board, row, col, BLACK);
    expect(nextBoard[row][col]).toBe(BLACK);
    expect(nextBoard[row + rowOffset][col + colOffset]).toBe(BLACK);
  });

  it('flips multiple directions in a single move', () => {
    const board = createEmptyBoard();
    const row = 3;
    const col = 3;

    [
      [-1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ].forEach(([rowOffset, colOffset]) => {
      board[row + rowOffset][col + colOffset] = WHITE;
      board[row + rowOffset * 2][col + colOffset * 2] = BLACK;
    });

    expect(getFlippableDiscs(board, row, col, BLACK)).toHaveLength(4);
    const nextBoard = applyMove(board, row, col, BLACK);
    expect(nextBoard.flat().filter((cell) => cell === BLACK)).toHaveLength(9);
  });

  it('does not capture an open line or leave the board boundary', () => {
    const board = createEmptyBoard();
    board[0][1] = WHITE;
    board[0][2] = WHITE;

    expect(getFlippableDiscs(board, 0, 0, BLACK)).toEqual([]);
    expect(isValidMove(board, -1, 0, BLACK)).toBe(false);
    expect(isValidMove(board, BOARD_SIZE, 0, BLACK)).toBe(false);
  });

  it('rejects occupied cells and cells that capture nothing', () => {
    const board = createInitialBoard();

    expect(isValidMove(board, 3, 3, BLACK)).toBe(false);
    expect(isValidMove(board, 0, 0, BLACK)).toBe(false);
    expect(applyMove(board, 3, 3, BLACK)).toBe(board);
    expect(applyMove(board, 0, 0, BLACK)).toBe(board);
  });

  it('applies a move without mutating the input board', () => {
    const board = createInitialBoard();
    const snapshot = board.map((row) => [...row]);
    const nextBoard = applyMove(board, 2, 3, BLACK);

    expect(board).toEqual(snapshot);
    expect(nextBoard).not.toBe(board);
    expect(nextBoard[2][3]).toBe(BLACK);
    expect(nextBoard[3][3]).toBe(BLACK);
    expect(board[2][3]).toBe(EMPTY);
    board.forEach((row, index) => {
      expect(nextBoard[index]).not.toBe(row);
    });
  });
});
