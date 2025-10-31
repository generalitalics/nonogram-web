import React from 'react';
import { isLevelCompleted } from '../utils/localStorage';

function LevelSelect({ puzzles, difficulty, onSelectLevel, onBack, onLogout }) {
  const filteredPuzzles = Object.values(puzzles).filter(
    puzzle => puzzle.difficulty === difficulty
  );

  return (
    <div className="level-select" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="btn-back" onClick={onBack}>
          ← Back to Difficulty
        </button>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
      <h1>{difficulty} Levels</h1>
      <div className="levels-grid">
        {filteredPuzzles.map((puzzle, index) => {
          const completed = isLevelCompleted(puzzle.id);
          return (
            <div
              key={puzzle.id}
              className="level-card"
              onClick={() => onSelectLevel(puzzle.id)}
            >
              {completed && (
                <div className="level-solved-badge level-floating">✓ Solved</div>
              )}
              <div className="level-number-large">
                {index + 1}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                {puzzle.rows} × {puzzle.cols}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LevelSelect;
