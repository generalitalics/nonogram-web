import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { puzzles } from '../puzzleData';
import { isLevelCompleted, unmarkLevelCompleted } from '../utils/localStorage';

function Puzzle({ puzzle, difficulty, onBack, onSolved, onNextLevel }) {
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
      
      // Mark level as completed
      if (onSolved) {
        onSolved(puzzle.id);
      }
    }
  }, [grid, isSolved, puzzle.id, onSolved]);

  const clearAll = () => {
    setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
    setIsSolved(false);
  };

  const handleConfirmReload = () => {
    setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
    setIsSolved(false);
    setShowCelebration(false);
    setIsReloaded(true);
    unmarkLevelCompleted(puzzle.id);
    setShowConfirmDialog(false);
  };

  // If level already solved, preload solution
  useEffect(() => {
    if (isLevelCompleted && isLevelCompleted(puzzle.id) && !isReloaded) {
      setGrid(puzzle.solution.map(row => row.map(v => (v === 1 ? 1 : 0))));
      setIsSolved(true);
      setShowCelebration(false);
      setJustSolved(false);
    } else {
      // ensure fresh grid when switching to unsolved
      setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
      setIsSolved(false);
      setShowCelebration(false);
      setJustSolved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

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
              <button className="btn btn-primary" onClick={onBack}>
                ← Back to Levels
              </button>
              {onNextLevel && (
                <button className="btn btn-next" onClick={onNextLevel}>
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
              {isSolved ? (
                <>
                  <button className="btn btn-primary" onClick={onBack}>
                    ← Back to Levels
                  </button>
                  {onNextLevel && (
                    <button className="btn btn-next" onClick={onNextLevel}>
                      Next Level →
                    </button>
                  )}
                </>
              ) : (
                <button className="btn btn-primary" onClick={onBack}>
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
