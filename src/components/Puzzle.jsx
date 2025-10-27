import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { puzzles } from '../puzzleData';

function Puzzle({ puzzle, difficulty, onBack }) {
  const [grid, setGrid] = useState(
    Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0))
  );
  const [mode, setMode] = useState('fill'); // 'fill' or 'erase'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r) => [...r]);
    if (mode === 'fill') {
      newGrid[row][col] = newGrid[row][col] === 1 ? 0 : 1;
    } else {
      newGrid[row][col] = newGrid[row][col] === -1 ? 0 : -1;
    }
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
          setGrid(newGrid);
        }
      } else {
        if (grid[row][col] !== -1) {
          newGrid[row][col] = -1;
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
    }
  }, [grid, isSolved]);

  const clearAll = () => {
    setGrid(Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(0)));
    setIsSolved(false);
  };

  // Find max number of clues in rows and columns
  const maxRowClues = Math.max(...puzzle.rowClues.map(c => c.length));
  const maxColClues = Math.max(...puzzle.colClues.map(c => c.length));

  const renderRowClues = () => {
    const cells = [];
    for (let rowIdx = 0; rowIdx < puzzle.rows; rowIdx++) {
      const clues = puzzle.rowClues[rowIdx];
      for (let clueIdx = 0; clueIdx < maxRowClues; clueIdx++) {
        const clue = clues[clueIdx] !== undefined ? clues[clueIdx] : '';
        cells.push(
          <div
            key={`row-${rowIdx}-clue-${clueIdx}`}
            className="clue-cell left-clue-cell"
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
        cells.push(
          <div
            key={`col-${colIdx}-clue-${clueIdx}`}
            className="clue-cell top-clue-cell"
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
      
      <div className="puzzle-header">
        <div className="puzzle-title">
          {isSolved ? puzzle.name : `Level ${levelNumber}`}
          {isSolved && <span className="solved-badge">✓ Solved</span>}
        </div>
        <div className="controls">
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
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Levels
          </button>
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
          className="clue-cell empty" 
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
              className={`cell ${cell === 1 ? 'filled' : ''} ${!isSolved && cell === -1 ? 'crossed' : ''}`}
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
