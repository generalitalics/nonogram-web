import React, { useState } from 'react';
import DifficultySelect from './components/DifficultySelect';
import LevelSelect from './components/LevelSelect';
import Puzzle from './components/Puzzle';
import { puzzles } from './puzzleData';
import { markLevelCompleted } from './utils/localStorage';

function App() {
  const [currentDifficulty, setCurrentDifficulty] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);

  const handleDifficultySelect = (difficulty) => {
    setCurrentDifficulty(difficulty);
  };

  const handleLevelSelect = (levelId) => {
    setCurrentPuzzle(levelId);
  };

  const handleLevelSolved = (levelId) => {
    markLevelCompleted(levelId);
  };

  const handleBackToLevels = () => {
    setCurrentPuzzle(null);
  };

  const handleBackToDifficulty = () => {
    setCurrentDifficulty(null);
    setCurrentPuzzle(null);
  };

  const handleNextLevel = () => {
    if (!currentDifficulty || !currentPuzzle) return;
    const filtered = Object.values(puzzles)
      .filter(p => p.difficulty === currentDifficulty)
      .sort((a, b) => a.id - b.id);
    const idx = filtered.findIndex(p => p.id === currentPuzzle);
    const next = idx >= 0 && idx < filtered.length - 1 ? filtered[idx + 1].id : null;
    if (next) {
      setCurrentPuzzle(next);
    } else {
      // no next level in this difficulty → go back to levels
      setCurrentPuzzle(null);
    }
  };

  return (
    <div className="app">
      {currentPuzzle ? (
        <Puzzle
          puzzle={puzzles[currentPuzzle]}
          difficulty={currentDifficulty}
          onBack={handleBackToLevels}
          onSolved={handleLevelSolved}
          onNextLevel={handleNextLevel}
        />
      ) : currentDifficulty ? (
        <LevelSelect
          puzzles={puzzles}
          difficulty={currentDifficulty}
          onSelectLevel={handleLevelSelect}
          onBack={handleBackToDifficulty}
        />
      ) : (
        <DifficultySelect onSelectDifficulty={handleDifficultySelect} />
      )}
    </div>
  );
}

export default App;
