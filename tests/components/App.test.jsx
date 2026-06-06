import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '../../src/App.jsx';

function getBoardButtons() {
  return within(
    screen.getByRole('grid', { name: '오델로 게임 보드' }),
  ).getAllByRole('button');
}

function getEnabledBoardButtons() {
  return getBoardButtons().filter((button) => !button.disabled);
}

describe('App', () => {
  it('renders the standard initial game', () => {
    render(<App />);

    expect(getBoardButtons()).toHaveLength(64);
    expect(getEnabledBoardButtons()).toHaveLength(4);
    expect(screen.getByText('현재 차례: 흑돌')).toBeInTheDocument();
    expect(screen.getByText('흑돌').nextElementSibling).toHaveTextContent('2');
    expect(screen.getByText('백돌').nextElementSibling).toHaveTextContent('2');
    expect(
      screen.getByRole('button', { name: '4행 4열, 백돌' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '4행 5열, 흑돌' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: '3행 4열, 빈칸, 착수 가능',
      }),
    ).toBeEnabled();
  });

  it('updates the board, score, and turn after a mouse move', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', {
        name: '3행 4열, 빈칸, 착수 가능',
      }),
    );

    expect(screen.getByText('현재 차례: 백돌')).toBeInTheDocument();
    expect(screen.getByText('흑돌').nextElementSibling).toHaveTextContent('4');
    expect(screen.getByText('백돌').nextElementSibling).toHaveTextContent('1');
    expect(
      screen.getByRole('button', { name: '3행 4열, 흑돌' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '4행 4열, 흑돌' }),
    ).toBeDisabled();
  });

  it('supports keyboard moves and ignores disabled cells', async () => {
    const user = userEvent.setup();
    render(<App />);
    const invalidCell = screen.getByRole('button', {
      name: '1행 1열, 빈칸',
    });
    const validCell = screen.getByRole('button', {
      name: '3행 4열, 빈칸, 착수 가능',
    });

    expect(invalidCell).toBeDisabled();
    validCell.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('현재 차례: 백돌')).toBeInTheDocument();
  });

  it('plays to completion, disables the board, and starts a new game', async () => {
    const user = userEvent.setup();
    render(<App />);

    for (let moveCount = 0; moveCount < 60; moveCount += 1) {
      const enabledButtons = getEnabledBoardButtons();

      if (enabledButtons.length === 0) {
        break;
      }

      await user.click(enabledButtons[0]);
    }

    expect(screen.getByText(/게임 종료:/)).toBeInTheDocument();
    expect(getEnabledBoardButtons()).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: '새 게임' }));

    expect(screen.getByText('현재 차례: 흑돌')).toBeInTheDocument();
    expect(screen.getByText('흑돌').nextElementSibling).toHaveTextContent('2');
    expect(screen.getByText('백돌').nextElementSibling).toHaveTextContent('2');
    expect(getEnabledBoardButtons()).toHaveLength(4);
  });
});
