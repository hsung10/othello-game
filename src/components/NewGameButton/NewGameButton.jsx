import './NewGameButton.css';

export function NewGameButton({ onStartNewGame }) {
  return (
    <button className="new-game-button" type="button" onClick={onStartNewGame}>
      새 게임
    </button>
  );
}
