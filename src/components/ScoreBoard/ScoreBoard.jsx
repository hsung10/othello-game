import './ScoreBoard.css';

export function ScoreBoard({ scores }) {
  return (
    <section className="score-board" aria-label="돌 점수">
      <div className="score-board__item">
        <span
          className="score-board__disc score-board__disc--black"
          aria-hidden="true"
        />
        <span>흑돌</span>
        <strong>{scores.black}</strong>
      </div>
      <div className="score-board__divider" aria-hidden="true">
        :
      </div>
      <div className="score-board__item">
        <span
          className="score-board__disc score-board__disc--white"
          aria-hidden="true"
        />
        <span>백돌</span>
        <strong>{scores.white}</strong>
      </div>
    </section>
  );
}
