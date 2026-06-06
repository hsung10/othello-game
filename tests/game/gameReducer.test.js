import { describe, expect, it } from 'vitest';

import {
  BLACK,
  EMPTY,
  GAME_STATUS,
  PLACE_DISC,
  START_NEW_GAME,
  WHITE,
} from '../../src/game/constants.js';
import { createEmptyBoard, createInitialBoard } from '../../src/game/board.js';
import {
  createInitialGameState,
  gameReducer,
} from '../../src/game/gameReducer.js';

function createState(board, currentPlayer = BLACK) {
  return {
    board,
    currentPlayer,
    status: GAME_STATUS.PLAYING,
    passMessage: null,
  };
}

describe('gameReducer', () => {
  it('creates an initial game with black to move', () => {
    const state = createInitialGameState();

    expect(state.board).toEqual(createInitialBoard());
    expect(state.currentPlayer).toBe(BLACK);
    expect(state.status).toBe(GAME_STATUS.PLAYING);
    expect(state.passMessage).toBeNull();
  });

  it('places and flips a disc before changing turns', () => {
    const state = createInitialGameState();
    const nextState = gameReducer(state, {
      type: PLACE_DISC,
      payload: { row: 2, col: 3 },
    });

    expect(nextState.board[2][3]).toBe(BLACK);
    expect(nextState.board[3][3]).toBe(BLACK);
    expect(nextState.currentPlayer).toBe(WHITE);
    expect(nextState.passMessage).toBeNull();
  });

  it('returns the same state for an invalid move', () => {
    const state = createInitialGameState();
    expect(
      gameReducer(state, {
        type: PLACE_DISC,
        payload: { row: 0, col: 0 },
      }),
    ).toBe(state);
  });

  it('automatically passes when only the opponent cannot move', () => {
    const board = createEmptyBoard().map((row) => row.map(() => BLACK));
    board[0][0] = EMPTY;
    board[0][1] = WHITE;
    board[0][3] = EMPTY;
    board[0][4] = WHITE;
    const state = createState(board);

    const nextState = gameReducer(state, {
      type: PLACE_DISC,
      payload: { row: 0, col: 0 },
    });

    expect(nextState.currentPlayer).toBe(BLACK);
    expect(nextState.status).toBe(GAME_STATUS.PLAYING);
    expect(nextState.passMessage).toMatch(/백돌.*패스/);
  });

  it('finishes when neither player has another move', () => {
    const board = createEmptyBoard().map((row) => row.map(() => BLACK));
    board[0][0] = EMPTY;
    board[0][1] = WHITE;
    const state = createState(board);

    const nextState = gameReducer(state, {
      type: PLACE_DISC,
      payload: { row: 0, col: 0 },
    });

    expect(nextState.status).toBe(GAME_STATUS.FINISHED);
    expect(nextState.board.flat().every((cell) => cell === BLACK)).toBe(true);
  });

  it('ignores moves after the game has finished', () => {
    const state = {
      ...createInitialGameState(),
      status: GAME_STATUS.FINISHED,
    };

    expect(
      gameReducer(state, {
        type: PLACE_DISC,
        payload: { row: 2, col: 3 },
      }),
    ).toBe(state);
  });

  it('starts a fresh game', () => {
    const board = createEmptyBoard();
    board[0][0] = WHITE;
    const state = {
      board,
      currentPlayer: WHITE,
      status: GAME_STATUS.FINISHED,
      passMessage: '패스',
    };

    const nextState = gameReducer(state, { type: START_NEW_GAME });

    expect(nextState).toEqual(createInitialGameState());
    expect(nextState.board).not.toBe(state.board);
  });
});
