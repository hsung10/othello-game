import { BLACK, DRAW, GAME_STATUS, WHITE } from '../../game/constants.js';
import './GameStatus.css';

const PLAYER_LABELS = {
  [BLACK]: '흑돌',
  [WHITE]: '백돌',
};

function getResultMessage(winner) {
  if (winner === DRAW) {
    return '게임 종료: 무승부입니다.';
  }

  return `게임 종료: ${PLAYER_LABELS[winner]} 승리입니다.`;
}

export function GameStatus({ currentPlayer, status, winner, passMessage }) {
  const statusMessage =
    status === GAME_STATUS.FINISHED
      ? getResultMessage(winner)
      : `현재 차례: ${PLAYER_LABELS[currentPlayer]}`;

  return (
    <section className="game-status" aria-live="polite" aria-atomic="true">
      <p className="game-status__primary">{statusMessage}</p>
      {passMessage && (
        <p className="game-status__pass" role="status">
          {passMessage}
        </p>
      )}
    </section>
  );
}
