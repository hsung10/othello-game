import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GameStatus } from '../../src/components/GameStatus/GameStatus.jsx';
import { BLACK, DRAW, GAME_STATUS, WHITE } from '../../src/game/constants.js';

describe('GameStatus', () => {
  it('announces when the AI is thinking', () => {
    render(
      <GameStatus
        currentPlayer={BLACK}
        status={GAME_STATUS.PLAYING}
        winner={null}
        passMessage={null}
        isAiThinking
      />,
    );

    expect(screen.getByText(/AI\(흑돌\).*생각 중/)).toBeInTheDocument();
  });

  it('announces the current turn and pass message', () => {
    render(
      <GameStatus
        currentPlayer={BLACK}
        status={GAME_STATUS.PLAYING}
        winner={null}
        passMessage="백돌 플레이어가 둘 곳이 없어 자동으로 패스했습니다."
      />,
    );

    expect(screen.getByText('현재 차례: 흑돌')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('자동으로 패스');
  });

  it.each([
    [BLACK, '흑돌 승리'],
    [WHITE, '백돌 승리'],
    [DRAW, '무승부'],
  ])('announces the final result for %s', (winner, resultText) => {
    render(
      <GameStatus
        currentPlayer={BLACK}
        status={GAME_STATUS.FINISHED}
        winner={winner}
        passMessage={null}
      />,
    );

    expect(screen.getByText(new RegExp(resultText))).toBeInTheDocument();
  });
});
