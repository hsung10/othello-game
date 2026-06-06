import { describe, expect, it } from 'vitest';

import {
  BLACK,
  BOARD_SIZE,
  EMPTY,
  WHITE,
} from '../../src/game/constants.js';
import {
  createEmptyBoard,
  createInitialBoard,
  isWithinBoard,
} from '../../src/game/board.js';

describe('createEmptyBoard', () => {
  it('creates an 8 by 8 board containing only empty cells', () => {
    const board = createEmptyBoard();

    expect(board).toHaveLength(BOARD_SIZE);
    board.forEach((row) => {
      expect(row).toHaveLength(BOARD_SIZE);
      expect(row.every((cell) => cell === EMPTY)).toBe(true);
    });
  });

  it('creates independent rows and board instances', () => {
    const firstBoard = createEmptyBoard();
    const secondBoard = createEmptyBoard();

    firstBoard[0][0] = BLACK;

    expect(firstBoard[1][0]).toBe(EMPTY);
    expect(secondBoard[0][0]).toBe(EMPTY);
    expect(firstBoard).not.toBe(secondBoard);
    expect(firstBoard[0]).not.toBe(firstBoard[1]);
    expect(firstBoard[0]).not.toBe(secondBoard[0]);
  });
});

describe('createInitialBoard', () => {
  it('places two black and two white discs in the standard center positions', () => {
    const board = createInitialBoard();
    const cells = board.flat();

    expect(cells.filter((cell) => cell === BLACK)).toHaveLength(2);
    expect(cells.filter((cell) => cell === WHITE)).toHaveLength(2);
    expect(cells.filter((cell) => cell === EMPTY)).toHaveLength(60);

    expect(board[3][3]).toBe(WHITE);
    expect(board[3][4]).toBe(BLACK);
    expect(board[4][3]).toBe(BLACK);
    expect(board[4][4]).toBe(WHITE);
  });

  it('returns a new independent board on every call', () => {
    const firstBoard = createInitialBoard();
    const secondBoard = createInitialBoard();

    firstBoard[3][3] = BLACK;

    expect(secondBoard[3][3]).toBe(WHITE);
    expect(firstBoard).not.toBe(secondBoard);
    firstBoard.forEach((row, index) => {
      expect(row).not.toBe(secondBoard[index]);
    });
  });
});

describe('isWithinBoard', () => {
  it.each([
    [0, 0],
    [0, BOARD_SIZE - 1],
    [BOARD_SIZE - 1, 0],
    [BOARD_SIZE - 1, BOARD_SIZE - 1],
    [3, 4],
  ])('accepts the board coordinate (%i, %i)', (row, col) => {
    expect(isWithinBoard(row, col)).toBe(true);
  });

  it.each([
    [-1, 0],
    [0, -1],
    [BOARD_SIZE, 0],
    [0, BOARD_SIZE],
    [1.5, 2],
    [2, 1.5],
    [Number.NaN, 0],
  ])('rejects the out-of-board coordinate (%s, %s)', (row, col) => {
    expect(isWithinBoard(row, col)).toBe(false);
  });
});
