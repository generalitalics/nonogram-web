import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { puzzles } from '../puzzleData';
import { isLevelCompleted, unmarkLevelCompleted } from '../utils/localStorage';
import { saveProgress, loadProgress, checkProgress } from '../utils/api';

function Puzzle({ puzzle, difficulty, onBack, onSolved, onNextLevel, username }) {
  const [grid, setGrid] = useState(
    Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0))
  );
  const [mode, setMode] = useState('fill'); // 'fill' or 'erase'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isReloaded, setIsReloaded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [justSolved, setJustSolved] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state - show loader immediately

  // Calculate level number based on difficulty
  const levelNumber = useMemo(() => {
    const filteredPuzzles = Object.values(puzzles).filter(
      p => p.difficulty === difficulty
    );
    const sortedIds = filteredPuzzles.map(p => p.id).sort((a, b) => a - b);
    return sortedIds.indexOf(puzzle.id) + 1;
  }, [difficulty, puzzle.id]);

  const getPuzzleIcon = (name) => {
    switch(name) {
      case 'Heart': return '❤️';
      case 'Smiley': return '😊';
      case 'Arrow': return '➡️';
      case 'Star': return '⭐';
      case 'Triangle': return '▲';
      case 'Butterfly': return '🦋';
      case 'Cat': return '🐱';
      case 'Dog': return '🐶';
      default: return '🎨';
    }
  };

  // Helpers to process lines
  const getLineGroups = (values) => {
    const groups = [];
    let count = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] === 1) {
        count++;
      } else if (count > 0) {
        groups.push(count);
        count = 0;
      }
    }
    if (count > 0) groups.push(count);
    return groups.length > 0 ? groups : [];
  };

  const doesLineMatchClues = (values, clues) => {
    const groups = getLineGroups(values);
    if (groups.length !== clues.length) return false;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] !== clues[i]) return false;
    }
    return true;
  };

  const autoMarkCrossesForRow = (workingGrid, rowIdx) => {
    const rowValues = workingGrid[rowIdx];
    const clues = puzzle.rowClues[rowIdx];
    if (doesLineMatchClues(rowValues, clues)) {
      for (let c = 0; c < rowValues.length; c++) {
        if (rowValues[c] === 0) {
          rowValues[c] = -1;
        }
      }
    }
  };

  const autoMarkCrossesForCol = (workingGrid, colIdx) => {
    const colValues = workingGrid.map(r => r[colIdx]);
    const clues = puzzle.colClues[colIdx];
    if (doesLineMatchClues(colValues, clues)) {
      for (let r = 0; r < workingGrid.length; r++) {
        if (workingGrid[r][colIdx] === 0) {
          workingGrid[r][colIdx] = -1;
        }
      }
    }
  };

  const applyPostChangeEffects = (workingGrid, changedRow, changedCol) => {
    // Auto-mark crosses on completed lines
    autoMarkCrossesForRow(workingGrid, changedRow);
    autoMarkCrossesForCol(workingGrid, changedCol);
  };

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r) => [...r]);
    if (mode === 'fill') {
      newGrid[row][col] = newGrid[row][col] === 1 ? 0 : 1;
    } else {
      newGrid[row][col] = newGrid[row][col] === -1 ? 0 : -1;
    }
    applyPostChangeEffects(newGrid, row, col);
    setGrid(newGrid);
  };

  const handleMouseDown = (row, col) => {
    setIsMouseDown(true);
    handleCellClick(row, col);
  };

  const handleMouseOver = (row, col) => {
    if (isMouseDown) {
      const newGrid = grid.map((r) => [...r]);
      if (mode === 'fill') {
        if (grid[row][col] !== 1) {
          newGrid[row][col] = 1;
          applyPostChangeEffects(newGrid, row, col);
          setGrid(newGrid);
        }
      } else {
        if (grid[row][col] !== -1) {
          newGrid[row][col] = -1;
          applyPostChangeEffects(newGrid, row, col);
          setGrid(newGrid);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const checkSolution = (currentGrid) => {
    // Compare ALL cells - must match exactly
    for (let row = 0; row < puzzle.rows; row++) {
      for (let col = 0; col < puzzle.cols; col++) {
        const cellValue = currentGrid[row][col];
        const shouldBeFilled = puzzle.solution[row][col] === 1;
        
        // Cell should be filled (1), but it's either empty (0) or crossed (-1)
        if (shouldBeFilled && cellValue !== 1) {
          return false;
        }
        
        // Cell should be empty, but it's filled (1)
        if (!shouldBeFilled && cellValue === 1) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    if (!isSolved && checkSolution(grid)) {
      // Remove all crosses (-1) when solved
      const cleanedGrid = grid.map(row => 
        row.map(cell => cell === -1 ? 0 : cell)
      );
      setGrid(cleanedGrid);
      
      setIsSolved(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      setJustSolved(true);
      
      // Save progress with 'completed' reason (use cleanedGrid)
      const matrix = cleanedGrid.map(row => 
        row.map(cell => cell === 1 ? 1 : 0)
      );
      if (username) {
        // Use levelNumber (sequential number within difficulty) instead of puzzle.id
        saveProgress(username, levelNumber, difficulty, matrix, 'completed').catch(err => 
          console.error('Failed to save progress:', err)
        );
      }
      
      // Mark level as completed
      if (onSolved) {
        onSolved(puzzle.id);
      }
    }
  }, [grid, isSolved, puzzle.id, onSolved, username, difficulty, levelNumber]);

  // Convert grid to matrix (0s and 1s only, -1 becomes 0)
  const gridToMatrix = (currentGrid) => {
    return currentGrid.map(row => 
      row.map(cell => cell === 1 ? 1 : 0)
    );
  };

  // Save progress with reason
  const saveProgressWithReason = useCallback(async (reason, currentGrid = grid) => {
    if (!username) {
      console.warn('⚠️ Cannot save progress: username is missing');
      return;
    }
    
    try {
      const matrix = gridToMatrix(currentGrid);
      console.log(`💾 Saving progress: reason="${reason}", level=${levelNumber}, difficulty="${difficulty}"`);
      // Use levelNumber (sequential number within difficulty) instead of puzzle.id
      await saveProgress(username, levelNumber, difficulty, matrix, reason);
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
      // Don't show error to user, just log it
    }
  }, [username, levelNumber, difficulty, grid]);

  const clearAll = () => {
    setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
    setIsSolved(false);
  };

  const handleSave = async () => {
    console.log('💾 Manual save triggered');
    await saveProgressWithReason('manual');
    // Show brief feedback (optional)
    alert('Progress saved!');
  };

  const handleBack = async () => {
    await saveProgressWithReason('back');
    onBack();
  };

  const handleNextLevel = async () => {
    await saveProgressWithReason('next_level');
    if (onNextLevel) {
      onNextLevel();
    }
  };

  const handleConfirmReload = () => {
    setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
    setIsSolved(false);
    setShowCelebration(false);
    setIsReloaded(true);
    unmarkLevelCompleted(puzzle.id);
    setShowConfirmDialog(false);
  };

  // Load progress from backend when level opens
  useEffect(() => {
    const loadLevelProgress = async () => {
      setIsLoading(true); // Show loader immediately
      const startTime = Date.now(); // Track start time for minimum display duration
      const MIN_LOADER_TIME = 500; // Minimum loader display time in milliseconds

      try {
        // If level already solved locally, show solution
        if (isLevelCompleted && isLevelCompleted(puzzle.id) && !isReloaded) {
          setGrid(puzzle.solution.map(row => row.map(v => (v === 1 ? 1 : 0))));
          setIsSolved(true);
          setShowCelebration(false);
          setJustSolved(false);
        } else if (username && !isReloaded) {
          // If user is logged in, try to load progress from backend
          try {
            // Step 1: Quick check (without matrix)
            const checkResult = await checkProgress(username, levelNumber, difficulty);
            
            // Step 2: Load full progress (with matrix) if progress exists
            if (checkResult.has_progress) {
              const progressData = await loadProgress(username, levelNumber, difficulty);
              
              if (progressData.has_progress && progressData.matrix) {
                // Validate matrix dimensions match puzzle
                if (
                  progressData.matrix.length === puzzle.rows &&
                  progressData.matrix[0]?.length === puzzle.cols
                ) {
                  console.log('✅ Loading saved progress into grid');
                  setGrid(progressData.matrix);
                } else {
                  console.warn('⚠️ Saved matrix dimensions do not match puzzle, using empty grid');
                  setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
                }
              } else {
                // No matrix in response, start with empty grid
                console.log('ℹ️ No matrix in progress data, starting with empty grid');
                setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
              }
            } else {
              // No progress found, start with empty grid
              console.log('ℹ️ No saved progress found, starting with empty grid');
              setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
            }
          } catch (error) {
            console.error('❌ Error loading progress, using empty grid:', error);
            // On error, start with empty grid
            setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
          }
        } else {
          // No username or reloaded - start with empty grid
          setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
        }

        setIsSolved(false);
        setShowCelebration(false);
        setJustSolved(false);
      } finally {
        // Ensure loader is shown for minimum duration to prevent flickering
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADER_TIME - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        setIsLoading(false); // Hide loader after minimum display time
      }
    };

    loadLevelProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id, username, levelNumber, difficulty, isReloaded]);

  // Find max number of clues in rows and columns
  const maxRowClues = Math.max(...puzzle.rowClues.map(c => c.length));
  const maxColClues = Math.max(...puzzle.colClues.map(c => c.length));

  const renderRowClues = () => {
    const cells = [];
    for (let rowIdx = 0; rowIdx < puzzle.rows; rowIdx++) {
      const clues = puzzle.rowClues[rowIdx];
      for (let clueIdx = 0; clueIdx < maxRowClues; clueIdx++) {
        const clue = clues[clueIdx] !== undefined ? clues[clueIdx] : '';
        const isLastClueCol = clueIdx === maxRowClues - 1;
        const isFirstClueCol = clueIdx === 0;
        cells.push(
          <div
            key={`row-${rowIdx}-clue-${clueIdx}`}
            className={`clue-cell left-clue-cell ${(rowIdx > 0 && rowIdx % 5 === 0) ? 'thick-top' : ''} ${isLastClueCol ? 'thick-right' : ''} ${isFirstClueCol ? 'no-offset-left' : ''}`}
            style={{
              gridColumn: clueIdx + 1,
              gridRow: rowIdx + maxColClues + 1
            }}
          >
            {clue}
          </div>
        );
      }
    }
    return cells;
  };

  const renderColClues = () => {
    const cells = [];
    for (let colIdx = 0; colIdx < puzzle.cols; colIdx++) {
      const clues = puzzle.colClues[colIdx];
      for (let clueIdx = 0; clueIdx < maxColClues; clueIdx++) {
        const clue = clues[clueIdx] !== undefined ? clues[clueIdx] : '';
        const isLastClueRow = clueIdx === maxColClues - 1;
        const isFirstClueRow = clueIdx === 0;
        cells.push(
          <div
            key={`col-${colIdx}-clue-${clueIdx}`}
            className={`clue-cell top-clue-cell ${(colIdx > 0 && colIdx % 5 === 0) ? 'thick-left' : ''} ${isLastClueRow ? 'thick-bottom' : ''} ${isFirstClueRow ? 'no-offset-top' : ''}`}
            style={{
              gridColumn: colIdx + maxRowClues + 1,
              gridRow: clueIdx + 1
            }}
          >
            {clue}
          </div>
        );
      }
    }
    return cells;
  };

  // Show loader while loading progress
  if (isLoading) {
    return (
      <div className="puzzle-container">
        <div className="loader-overlay">
          <div className="loader-content">
            <div className="loader-spinner"></div>
            <p>Loading level...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="puzzle-container">
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h2>Congratulations!</h2>
            <p>It's a <strong>{puzzle.name}</strong>!</p>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h2>Restart Level?</h2>
            <p>Are you sure you want to restart this level?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleConfirmReload}>
                Yes
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="puzzle-header">
        <div className="puzzle-title">
          {isSolved ? puzzle.name : `Level ${levelNumber}`}
          {isSolved && <span className="solved-badge">✓ Solved</span>}
        </div>
        <div className="controls">
          {isLevelCompleted && isLevelCompleted(puzzle.id) && !isReloaded ? (
            <>
              <button
                className="btn btn-reload"
                onClick={() => setShowConfirmDialog(true)}
              >
                Reload
              </button>
              <button className="btn btn-primary" onClick={handleBack}>
                ← Back to Levels
              </button>
              {onNextLevel && (
                <button className="btn btn-next" onClick={handleNextLevel}>
                  Next Level →
                </button>
              )}
            </>
          ) : (
            <>
              <div className="mode-indicator">
                Mode: <span>{mode === 'fill' ? '🎨 Fill' : '❌ Erase'}</span>
              </div>
              <button
                className="btn btn-toggle"
                onClick={() => setMode(mode === 'fill' ? 'erase' : 'fill')}
              >
                Toggle Mode
              </button>
              <button className="btn btn-secondary" onClick={clearAll}>
                Clear All
              </button>
              <button className="btn btn-primary" onClick={handleSave} style={{ background: '#17a2b8' }}>
                💾 Save
              </button>
              {isSolved ? (
                <>
                  <button className="btn btn-primary" onClick={handleBack}>
                    ← Back to Levels
                  </button>
                  {onNextLevel && (
                    <button className="btn btn-next" onClick={handleNextLevel}>
                      Next Level →
                    </button>
                  )}
                </>
              ) : (
                <button className="btn btn-primary" onClick={handleBack}>
                  ← Back to Levels
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className="nonogram-grid"
        style={{
          '--rows': puzzle.rows + maxColClues,
          '--cols': puzzle.cols + maxRowClues,
        }}
      >
        {/* Empty corner cell */}
        <div 
          className="clue-cell empty corner-cell" 
          style={{ 
            gridColumn: `1 / ${maxRowClues + 1}`,
            gridRow: `1 / ${maxColClues + 1}`
          }}
        ></div>

        {/* Top clues (column headings) */}
        {renderColClues()}

        {/* Left clues (row headings) */}
        {renderRowClues()}

        {/* Puzzle grid */}
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`cell ${cell === 1 ? 'filled' : ''} ${!isSolved && cell === -1 ? 'crossed' : ''} ${(colIdx > 0 && colIdx % 5 === 0) ? 'thick-left' : ''} ${(rowIdx > 0 && rowIdx % 5 === 0) ? 'thick-top' : ''}`}
              style={{
                gridColumn: colIdx + maxRowClues + 1,
                gridRow: rowIdx + maxColClues + 1
              }}
              onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
              onMouseOver={() => handleMouseOver(rowIdx, colIdx)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Puzzle;
