import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BoardCell } from '../../src/components/BoardCell/BoardCell.jsx';
import { EMPTY } from '../../src/game/constants.js';

describe('BoardCell', () => {
  it('allows a valid move with the keyboard', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <BoardCell
        row={2}
        col={3}
        value={EMPTY}
        isValid
        isDisabled={false}
        onSelect={handleSelect}
      />,
    );

    const cell = screen.getByRole('button', {
      name: '3행 4열, 빈칸, 착수 가능',
    });
    cell.focus();
    await user.keyboard('{Enter}');

    expect(handleSelect).toHaveBeenCalledWith(2, 3);
  });
});
