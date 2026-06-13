import { AI_DIFFICULTY, BLACK, BOARD_SIZE } from './constants.js';
import {
  applyMove,
  getFlippableDiscs,
  getOpponent,
  getValidMoves,
} from './rules.js';
import { countDiscs } from './selectors.js';

const POSITION_WEIGHTS = Object.freeze([
  Object.freeze([120, -30, 20, 5, 5, 20, -30, 120]),
  Object.freeze([-30, -45, -5, -5, -5, -5, -45, -30]),
  Object.freeze([20, -5, 15, 3, 3, 15, -5, 20]),
  Object.freeze([5, -5, 3, 3, 3, 3, -5, 5]),
  Object.freeze([5, -5, 3, 3, 3, 3, -5, 5]),
  Object.freeze([20, -5, 15, 3, 3, 15, -5, 20]),
  Object.freeze([-30, -45, -5, -5, -5, -5, -45, -30]),
  Object.freeze([120, -30, 20, 5, 5, 20, -30, 120]),
]);

const SEARCH_DEPTH = 4;
const TERMINAL_SCORE = 100_000;

function getRandomMove(validMoves, random) {
  const randomIndex = Math.floor(random() * validMoves.length);
  return validMoves[Math.min(randomIndex, validMoves.length - 1)];
}

function getPositionScore(board, player) {
  const opponent = getOpponent(player);
  let score = 0;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (board[row][col] === opponent) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }

  return score;
}

function evaluateBoard(board, player) {
  const opponent = getOpponent(player);
  const playerMoves = getValidMoves(board, player);
  const opponentMoves = getValidMoves(board, opponent);
  const scores = countDiscs(board);
  const discDifference =
    player === BLACK
      ? scores.black - scores.white
      : scores.white - scores.black;

  if (playerMoves.length === 0 && opponentMoves.length === 0) {
    if (discDifference > 0) {
      return TERMINAL_SCORE + discDifference;
    }

    if (discDifference < 0) {
      return -TERMINAL_SCORE + discDifference;
    }

    return 0;
  }

  return (
    getPositionScore(board, player) +
    (playerMoves.length - opponentMoves.length) * 8 +
    discDifference
  );
}

function orderMoves(moves) {
  return [...moves].sort(
    (first, second) =>
      POSITION_WEIGHTS[second.row][second.col] -
        POSITION_WEIGHTS[first.row][first.col] ||
      first.row - second.row ||
      first.col - second.col,
  );
}

function getIntermediateMove(board, player, validMoves) {
  const opponent = getOpponent(player);
  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  orderMoves(validMoves).forEach((move) => {
    const nextBoard = applyMove(board, move.row, move.col, player);
    const score =
      POSITION_WEIGHTS[move.row][move.col] * 4 +
      getFlippableDiscs(board, move.row, move.col, player).length * 2 -
      getValidMoves(nextBoard, opponent).length * 8;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
}

function minimax(board, currentPlayer, aiPlayer, depth, alpha, beta) {
  const validMoves = getValidMoves(board, currentPlayer);
  const opponent = getOpponent(currentPlayer);
  const opponentMoves =
    validMoves.length === 0 ? getValidMoves(board, opponent) : null;

  if (depth === 0 || (validMoves.length === 0 && opponentMoves.length === 0)) {
    return evaluateBoard(board, aiPlayer);
  }

  if (validMoves.length === 0) {
    return minimax(board, opponent, aiPlayer, depth - 1, alpha, beta);
  }

  if (currentPlayer === aiPlayer) {
    let bestScore = -Infinity;

    for (const move of orderMoves(validMoves)) {
      const nextBoard = applyMove(board, move.row, move.col, currentPlayer);
      bestScore = Math.max(
        bestScore,
        minimax(nextBoard, opponent, aiPlayer, depth - 1, alpha, beta),
      );
      alpha = Math.max(alpha, bestScore);

      if (beta <= alpha) {
        break;
      }
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const move of orderMoves(validMoves)) {
    const nextBoard = applyMove(board, move.row, move.col, currentPlayer);
    bestScore = Math.min(
      bestScore,
      minimax(nextBoard, opponent, aiPlayer, depth - 1, alpha, beta),
    );
    beta = Math.min(beta, bestScore);

    if (beta <= alpha) {
      break;
    }
  }

  return bestScore;
}

function getAdvancedMove(board, player, validMoves) {
  const opponent = getOpponent(player);
  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of orderMoves(validMoves)) {
    const nextBoard = applyMove(board, move.row, move.col, player);
    const score = minimax(
      nextBoard,
      opponent,
      player,
      SEARCH_DEPTH - 1,
      -Infinity,
      Infinity,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Returns one valid AI move, or null when the player must pass.
 */
export function chooseAiMove(board, player, difficulty, random = Math.random) {
  const validMoves = getValidMoves(board, player);

  if (validMoves.length === 0) {
    return null;
  }

  if (difficulty === AI_DIFFICULTY.BEGINNER) {
    return getRandomMove(validMoves, random);
  }

  if (difficulty === AI_DIFFICULTY.ADVANCED) {
    return getAdvancedMove(board, player, validMoves);
  }

  return getIntermediateMove(board, player, validMoves);
}
