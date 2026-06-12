import { AI_DIFFICULTY } from '../../game/constants.js';
import './DifficultySelector.css';

const DIFFICULTY_OPTIONS = [
  { value: AI_DIFFICULTY.BEGINNER, label: '초급' },
  { value: AI_DIFFICULTY.INTERMEDIATE, label: '중급' },
  { value: AI_DIFFICULTY.ADVANCED, label: '고급' },
];

export function DifficultySelector({ difficulty, onChangeDifficulty }) {
  function handleChange(event) {
    onChangeDifficulty(event.target.value);
  }

  return (
    <div className="difficulty-selector">
      <label htmlFor="ai-difficulty">AI 난이도</label>
      <select id="ai-difficulty" value={difficulty} onChange={handleChange}>
        {DIFFICULTY_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <small>변경하면 새 게임이 시작됩니다.</small>
    </div>
  );
}
