import React, { useState } from 'react';
import DifficultySelect from './components/DifficultySelect';
import LevelSelect from './components/LevelSelect';
import Puzzle from './components/Puzzle';
import { puzzles } from './puzzleData';

function App() {
  const [currentDifficulty, setCurrentDifficulty] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);

  const handleDifficultySelect = (difficulty) => {
    setCurrentDifficulty(difficulty);
  };

  const handleLevelSelect = (levelId) => {
    setCurrentPuzzle(levelId);
  };

  const handleBackToLevels = () => {
    setCurrentPuzzle(null);
  };

  const handleBackToDifficulty = () => {
    setCurrentDifficulty(null);
    setCurrentPuzzle(null);
  };

  return (
    <div className="app">
      {currentPuzzle ? (
        <Puzzle
          puzzle={puzzles[currentPuzzle]}
          difficulty={currentDifficulty}
          onBack={handleBackToLevels}
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
