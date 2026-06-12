import {
  AI_DIFFICULTY,
  BLACK,
  CHANGE_DIFFICULTY,
  GAME_STATUS,
  PLACE_DISC,
  START_NEW_GAME,
} from './constants.js';
import { createInitialBoard } from './board.js';
import { applyMove, getOpponent, getValidMoves, isValidMove } from './rules.js';

const PLAYER_LABELS = {
  black: '흑돌',
  white: '백돌',
};

export function createInitialGameState(
  difficulty = AI_DIFFICULTY.INTERMEDIATE,
) {
  return {
    board: createInitialBoard(),
    currentPlayer: BLACK,
    status: GAME_STATUS.PLAYING,
    passMessage: null,
    difficulty,
  };
}

function placeDisc(state, row, col) {
  if (
    state.status !== GAME_STATUS.PLAYING ||
    !isValidMove(state.board, row, col, state.currentPlayer)
  ) {
    return state;
  }

  const nextBoard = applyMove(state.board, row, col, state.currentPlayer);
  const opponent = getOpponent(state.currentPlayer);

  if (getValidMoves(nextBoard, opponent).length > 0) {
    return {
      ...state,
      board: nextBoard,
      currentPlayer: opponent,
      status: GAME_STATUS.PLAYING,
      passMessage: null,
    };
  }

  if (getValidMoves(nextBoard, state.currentPlayer).length > 0) {
    return {
      ...state,
      board: nextBoard,
      currentPlayer: state.currentPlayer,
      status: GAME_STATUS.PLAYING,
      passMessage: `${PLAYER_LABELS[opponent]} 플레이어가 둘 곳이 없어 자동으로 패스했습니다.`,
    };
  }

  return {
    ...state,
    board: nextBoard,
    currentPlayer: state.currentPlayer,
    status: GAME_STATUS.FINISHED,
    passMessage: null,
  };
}

export function gameReducer(state, action) {
  if (action.type === PLACE_DISC) {
    return placeDisc(state, action.payload.row, action.payload.col);
  }

  if (action.type === START_NEW_GAME) {
    return createInitialGameState(state.difficulty);
  }

  if (action.type === CHANGE_DIFFICULTY) {
    return createInitialGameState(action.payload.difficulty);
  }

  return state;
}
