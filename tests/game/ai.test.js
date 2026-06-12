import { describe, expect, it } from 'vitest';

import { chooseAiMove } from '../../src/game/ai.js';
import { AI_DIFFICULTY, BLACK, WHITE } from '../../src/game/constants.js';
import { createEmptyBoard, createInitialBoard } from '../../src/game/board.js';
import { getValidMoves, isValidMove } from '../../src/game/rules.js';

describe('chooseAiMove', () => {
  it.each(Object.values(AI_DIFFICULTY))(
    'returns a valid move at %s difficulty',
    (difficulty) => {
      const board = createInitialBoard();
      const move = chooseAiMove(board, BLACK, difficulty, () => 0);

      expect(isValidMove(board, move.row, move.col, BLACK)).toBe(true);
    },
  );

  it('returns null when the player has no valid move', () => {
    const board = createEmptyBoard().map((row) => row.map(() => BLACK));

    expect(chooseAiMove(board, WHITE, AI_DIFFICULTY.ADVANCED)).toBeNull();
  });

  it('uses the supplied random function for beginner moves', () => {
    const board = createInitialBoard();
    const validMoves = getValidMoves(board, BLACK);

    expect(chooseAiMove(board, BLACK, AI_DIFFICULTY.BEGINNER, () => 0)).toEqual(
      validMoves[0],
    );
    expect(
      chooseAiMove(board, BLACK, AI_DIFFICULTY.BEGINNER, () => 0.999),
    ).toEqual(validMoves.at(-1));
  });

  it.each([AI_DIFFICULTY.INTERMEDIATE, AI_DIFFICULTY.ADVANCED])(
    'takes an available corner at %s difficulty',
    (difficulty) => {
      const board = createInitialBoard();
      board[0][1] = WHITE;
      board[0][2] = BLACK;

      expect(chooseAiMove(board, BLACK, difficulty)).toEqual({
        row: 0,
        col: 0,
      });
    },
  );
});
