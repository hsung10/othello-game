import { useEffect, useReducer } from 'react';

import { chooseAiMove } from '../game/ai.js';
import {
  BLACK,
  CHANGE_DIFFICULTY,
  GAME_STATUS,
  PLACE_DISC,
  START_NEW_GAME,
  WHITE,
} from '../game/constants.js';
import { createInitialGameState, gameReducer } from '../game/gameReducer.js';
import { countDiscs, getWinner, selectValidMoves } from '../game/selectors.js';

const AI_MOVE_DELAY = 450;

export function useOthelloGame() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );
  const scores = countDiscs(state.board);
  const validMoves =
    state.status === GAME_STATUS.PLAYING && state.currentPlayer === WHITE
      ? selectValidMoves(state.board, state.currentPlayer)
      : [];
  const winner =
    state.status === GAME_STATUS.FINISHED ? getWinner(state.board) : null;
  const isAiThinking =
    state.status === GAME_STATUS.PLAYING && state.currentPlayer === BLACK;

  useEffect(() => {
    if (!isAiThinking) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const move = chooseAiMove(
        state.board,
        state.currentPlayer,
        state.difficulty,
      );

      if (move) {
        dispatch({ type: PLACE_DISC, payload: move });
      }
    }, AI_MOVE_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [isAiThinking, state.board, state.currentPlayer, state.difficulty]);

  function placeDisc(row, col) {
    if (state.currentPlayer !== WHITE) {
      return;
    }

    dispatch({ type: PLACE_DISC, payload: { row, col } });
  }

  function startNewGame() {
    dispatch({ type: START_NEW_GAME });
  }

  function changeDifficulty(difficulty) {
    dispatch({ type: CHANGE_DIFFICULTY, payload: { difficulty } });
  }

  return {
    ...state,
    scores,
    validMoves,
    winner,
    isAiThinking,
    placeDisc,
    startNewGame,
    changeDifficulty,
  };
}
