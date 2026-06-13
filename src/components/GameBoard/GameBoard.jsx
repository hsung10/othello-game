import { GAME_STATUS } from '../../game/constants.js';
import {
  createValidMoveKeySet,
  getCoordinateKey,
} from '../../game/selectors.js';
import { BoardCell } from '../BoardCell/BoardCell.jsx';
import './GameBoard.css';

export function GameBoard({
  board,
  validMoves,
  status,
  isInputDisabled,
  onCellSelect,
}) {
  const validMoveKeys = createValidMoveKeySet(validMoves);
  const isGameOver = status === GAME_STATUS.FINISHED;

  return (
    <div
      className="game-board"
      role="grid"
      aria-label="오델로 게임 보드"
      aria-rowcount="8"
      aria-colcount="8"
      aria-busy={isInputDisabled}
    >
      {board.map((boardRow, row) =>
        boardRow.map((value, col) => {
          const coordinateKey = getCoordinateKey(row, col);

          return (
            <BoardCell
              key={coordinateKey}
              row={row}
              col={col}
              value={value}
              isValid={validMoveKeys.has(coordinateKey)}
              isDisabled={isGameOver || isInputDisabled}
              onSelect={onCellSelect}
            />
          );
        }),
      )}
    </div>
  );
}
