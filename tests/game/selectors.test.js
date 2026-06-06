import { describe, expect, it } from 'vitest';

import { BLACK, DRAW, EMPTY, WHITE } from '../../src/game/constants.js';
import { createEmptyBoard, createInitialBoard } from '../../src/game/board.js';
import {
  countDiscs,
  createValidMoveKeySet,
  getCoordinateKey,
  getWinner,
  isGameOver,
  selectValidMoves,
} from '../../src/game/selectors.js';

describe('selectors', () => {
  it('counts the initial discs', () => {
    expect(countDiscs(createInitialBoard())).toEqual({
      black: 2,
      white: 2,
      empty: 60,
    });
  });

  it('detects a full board as game over', () => {
    const board = createEmptyBoard().map((row) => row.map(() => BLACK));
    expect(isGameOver(board)).toBe(true);
  });

  it('detects game over with empty cells when neither player can move', () => {
    const board = createEmptyBoard();
    board[0][0] = BLACK;
    board[7][7] = WHITE;

    expect(isGameOver(board)).toBe(true);
  });

  it('continues when only one player can move', () => {
    const board = createEmptyBoard().map((row) => row.map(() => BLACK));
    board[0][0] = EMPTY;
    board[0][1] = WHITE;

    expect(selectValidMoves(board, BLACK)).toEqual([{ row: 0, col: 0 }]);
    expect(selectValidMoves(board, WHITE)).toEqual([]);
    expect(isGameOver(board)).toBe(false);
  });

  it.each([
    [BLACK, [BLACK, BLACK, WHITE]],
    [WHITE, [WHITE, WHITE, BLACK]],
    [DRAW, [BLACK, WHITE]],
  ])('returns the expected winner %s', (winner, cells) => {
    const board = createEmptyBoard();
    cells.forEach((cell, col) => {
      board[0][col] = cell;
    });

    expect(getWinner(board)).toBe(winner);
  });

  it('creates stable coordinate keys for UI lookup', () => {
    const keys = createValidMoveKeySet([{ row: 2, col: 3 }]);

    expect(getCoordinateKey(2, 3)).toBe('2-3');
    expect(keys.has('2-3')).toBe(true);
  });
});
