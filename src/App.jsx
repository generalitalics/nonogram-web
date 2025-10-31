import React, { useState } from 'react';
import DifficultySelect from './components/DifficultySelect';
import LevelSelect from './components/LevelSelect';
import Puzzle from './components/Puzzle';
import Admin from './components/Admin';
import { puzzles } from './puzzleData';
import { markLevelCompleted } from './utils/localStorage';

function App() {
  const [currentDifficulty, setCurrentDifficulty] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleOpenAdmin = () => {
    setIsAdmin(true);
    if (window?.history?.pushState) {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleCloseAdmin = () => {
    setIsAdmin(false);
    if (window?.history?.pushState) {
      window.history.pushState({}, '', '/');
    }
  };

  React.useEffect(() => {
    // initial path check
    if (window.location.pathname === '/admin') {
      setIsAdmin(true);
    }
    const onPop = () => {
      setIsAdmin(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
      {isAdmin ? (
        <Admin onClose={handleCloseAdmin} />
      ) : currentPuzzle ? (
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
        <DifficultySelect onSelectDifficulty={handleDifficultySelect} onOpenAdmin={handleOpenAdmin} />
      )}
    </div>
  );
}

export default App;
