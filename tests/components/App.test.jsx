import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App.jsx';

function getBoardButtons() {
  return within(
    screen.getByRole('grid', { name: '오델로 게임 보드' }),
  ).getAllByRole('button');
}

function getEnabledBoardButtons() {
  return getBoardButtons().filter((button) => !button.disabled);
}

async function finishAiTurn() {
  await act(async () => {
    vi.advanceTimersByTime(500);
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the black AI and then gives the user the white turn', async () => {
    render(<App />);

    expect(getBoardButtons()).toHaveLength(64);
    expect(getEnabledBoardButtons()).toHaveLength(0);
    expect(screen.getByText(/AI\(흑돌\).*생각 중/)).toBeInTheDocument();
    expect(screen.getByRole('grid')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('AI 난이도')).toHaveValue('intermediate');

    await finishAiTurn();

    expect(screen.getByText('내 차례: 백돌')).toBeInTheDocument();
    expect(screen.getByText('흑돌').nextElementSibling).toHaveTextContent('4');
    expect(screen.getByText('백돌').nextElementSibling).toHaveTextContent('1');
    expect(getEnabledBoardButtons().length).toBeGreaterThan(0);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-busy', 'false');
  });

  it('accepts a mouse move only on the white turn and runs the next AI turn', async () => {
    render(<App />);
    await finishAiTurn();

    fireEvent.click(getEnabledBoardButtons()[0]);

    expect(screen.getByText(/AI\(흑돌\).*생각 중/)).toBeInTheDocument();
    expect(getEnabledBoardButtons()).toHaveLength(0);

    await finishAiTurn();

    expect(screen.getByText('내 차례: 백돌')).toBeInTheDocument();
    expect(getEnabledBoardButtons().length).toBeGreaterThan(0);
  });

  it('activates a focused valid cell for the user', async () => {
    render(<App />);
    await finishAiTurn();
    const validCell = getEnabledBoardButtons()[0];

    validCell.focus();
    fireEvent.click(validCell);

    expect(screen.getByText(/AI\(흑돌\).*생각 중/)).toBeInTheDocument();
  });

  it('changes difficulty by starting a new game and preserves it on restart', async () => {
    render(<App />);
    await finishAiTurn();

    fireEvent.change(screen.getByLabelText('AI 난이도'), {
      target: { value: 'beginner' },
    });

    expect(screen.getByLabelText('AI 난이도')).toHaveValue('beginner');
    expect(screen.getByText(/AI\(흑돌\).*생각 중/)).toBeInTheDocument();
    expect(screen.getByText('흑돌').nextElementSibling).toHaveTextContent('2');
    expect(screen.getByText('백돌').nextElementSibling).toHaveTextContent('2');

    await finishAiTurn();
    fireEvent.click(screen.getByRole('button', { name: '새 게임' }));

    expect(screen.getByLabelText('AI 난이도')).toHaveValue('beginner');
    expect(screen.getByText('흑돌').nextElementSibling).toHaveTextContent('2');
    expect(screen.getByText('백돌').nextElementSibling).toHaveTextContent('2');
    expect(getEnabledBoardButtons()).toHaveLength(0);
  });
});
