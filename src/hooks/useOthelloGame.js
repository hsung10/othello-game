import { useReducer } from 'react';

import { GAME_STATUS, PLACE_DISC, START_NEW_GAME } from '../game/constants.js';
import { createInitialGameState, gameReducer } from '../game/gameReducer.js';
import { countDiscs, getWinner, selectValidMoves } from '../game/selectors.js';

export function useOthelloGame() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );
  const scores = countDiscs(state.board);
  const validMoves =
    state.status === GAME_STATUS.PLAYING
      ? selectValidMoves(state.board, state.currentPlayer)
      : [];
  const winner =
    state.status === GAME_STATUS.FINISHED ? getWinner(state.board) : null;

  function placeDisc(row, col) {
    dispatch({ type: PLACE_DISC, payload: { row, col } });
  }

  function startNewGame() {
    dispatch({ type: START_NEW_GAME });
  }

  return {
    ...state,
    scores,
    validMoves,
    winner,
    placeDisc,
    startNewGame,
  };
}
