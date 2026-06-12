import { DifficultySelector } from './components/DifficultySelector/DifficultySelector.jsx';
import { GameBoard } from './components/GameBoard/GameBoard.jsx';
import { GameStatus } from './components/GameStatus/GameStatus.jsx';
import { NewGameButton } from './components/NewGameButton/NewGameButton.jsx';
import { ScoreBoard } from './components/ScoreBoard/ScoreBoard.jsx';
import { useOthelloGame } from './hooks/useOthelloGame.js';

function App() {
  const game = useOthelloGame();

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">Classic board game</p>
        <h1>오델로</h1>
        <p className="app-header__description">
          AI는 흑돌, 플레이어는 백돌입니다. 상대 돌을 감싸 뒤집으세요.
        </p>
      </header>

      <div className="game-layout">
        <div className="game-layout__board">
          <GameBoard
            board={game.board}
            validMoves={game.validMoves}
            status={game.status}
            isInputDisabled={game.isAiThinking}
            onCellSelect={game.placeDisc}
          />
        </div>

        <aside className="game-panel" aria-label="게임 정보">
          <ScoreBoard scores={game.scores} />
          <GameStatus
            currentPlayer={game.currentPlayer}
            status={game.status}
            winner={game.winner}
            passMessage={game.passMessage}
            isAiThinking={game.isAiThinking}
          />
          <DifficultySelector
            difficulty={game.difficulty}
            onChangeDifficulty={game.changeDifficulty}
          />
          <NewGameButton onStartNewGame={game.startNewGame} />
        </aside>
      </div>
    </main>
  );
}

export default App;
