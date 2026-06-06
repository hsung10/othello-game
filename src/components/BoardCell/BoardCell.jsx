import { BLACK, EMPTY, WHITE } from '../../game/constants.js';
import './BoardCell.css';

const DISC_LABELS = {
  [BLACK]: '흑돌',
  [WHITE]: '백돌',
  [EMPTY]: '빈칸',
};

export function BoardCell({ row, col, value, isValid, isGameOver, onSelect }) {
  const position = `${row + 1}행 ${col + 1}열`;
  const moveLabel = isValid ? ', 착수 가능' : '';
  const accessibleName = `${position}, ${DISC_LABELS[value]}${moveLabel}`;

  function handleClick() {
    onSelect(row, col);
  }

  return (
    <button
      className={`board-cell${isValid ? ' board-cell--valid' : ''}`}
      type="button"
      aria-label={accessibleName}
      disabled={!isValid || isGameOver}
      onClick={handleClick}
    >
      {value !== EMPTY && (
        <span
          className={`board-cell__disc board-cell__disc--${value}`}
          aria-hidden="true"
        />
      )}
      {isValid && (
        <span className="board-cell__valid-marker" aria-hidden="true" />
      )}
    </button>
  );
}
