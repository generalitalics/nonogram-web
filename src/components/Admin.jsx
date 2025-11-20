import React, { useState, useEffect } from 'react';

function Admin({ onClose, onLogout }) {
  const [size, setSize] = useState('10x10');
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('');
  const [grid, setGrid] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragValue, setDragValue] = useState(null); // 0 or 1 for painting during drag
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Initialize grid when matrix is generated
  const initializeGrid = (matrix) => {
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      setGrid(null);
      return;
    }
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    // Initialize grid from matrix (1 stays 1, 0 becomes 0)
    const newGrid = matrix.map(row => [...row]);
    setGrid(newGrid);
  };

  // Handle cell interactions
  const handleCellClick = (row, col) => {
    if (!grid) return;
    const newGrid = grid.map((r) => [...r]);
    const newValue = newGrid[row][col] === 1 ? 0 : 1;
    newGrid[row][col] = newValue;
    setGrid(newGrid);
  };

  const handleMouseDown = (row, col) => {
    if (!grid) return;
    setIsMouseDown(true);
    const current = grid[row][col];
    const newValue = current === 1 ? 0 : 1;
    setDragValue(newValue);
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = newValue;
    setGrid(newGrid);
  };

  const handleMouseOver = (row, col) => {
    if (!grid || !isMouseDown) return;
    const newGrid = grid.map((r) => [...r]);
    if (newGrid[row][col] !== dragValue) {
      newGrid[row][col] = dragValue;
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDragValue(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`/api/nonogram/create?size=${encodeURIComponent(size)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Parse response according to the example format: {emoji, label, matrix}
      // Backend returns: {emoji, label, matrix}
      if (data.label) setLabel(data.label);
      if (data.emoji) setEmoji(data.emoji);
      if (data.matrix !== undefined && data.matrix !== null) {
        if (Array.isArray(data.matrix)) {
          // Matrix is a 2D array - initialize grid
          initializeGrid(data.matrix);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch. Make sure the backend server is running on port 8000.';
      setError(`Error: ${errorMessage}`);
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    if (!grid) return;
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    setGrid(Array(rows).fill(null).map(() => Array(cols).fill(0)));
  };

  const getGridSize = () => {
    if (!grid || grid.length === 0) return { rows: 0, cols: 0 };
    return { rows: grid.length, cols: grid[0]?.length || 0 };
  };

  // Format matrix for readable display
  const formatMatrix = (matrix) => {
    if (!matrix || matrix.length === 0) return '';
    return matrix.map(row => 
      '  [' + row.join(', ') + ']'
    ).join(',\n');
  };

  const gridSize = getGridSize();
  const matrixText = grid ? '[\n' + formatMatrix(grid) + '\n]' : '';

  return (
    <div className="level-select" style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 12px' }}>
        <button 
          className="btn-back" 
          onClick={onClose}
        >
          ← Back
        </button>
        <button 
          className="btn-logout" 
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
      
      <h1>Admin Panel</h1>
      
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: 24, 
        maxWidth: 1200, 
        margin: '0 auto', 
        color: '#2c3e50' 
      }}>
        <h2 style={{ marginBottom: 24 }}>Nonogram Generator</h2>
        
        {/* Size Input and Generate Button */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34495e' }}>Size:</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="10x10"
              style={{
                padding: '8px 12px',
                border: '2px solid #bdc3c7',
                borderRadius: 8,
                fontSize: '1rem',
                width: '120px'
              }}
            />
          </div>
          
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ marginTop: '24px' }}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: 12, 
            background: '#fee', 
            color: '#c33', 
            borderRadius: 8, 
            marginBottom: 16 
          }}>
            {error}
          </div>
        )}

        {/* Label and Emoji Display */}
        {(label || emoji) && (
          <div style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
            {emoji && <span style={{ fontSize: '2rem', marginRight: 12 }}>{emoji}</span>}
            {label && <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{label}</span>}
          </div>
        )}

        {/* Editing controls removed as requested */}

        {/* Interactive Grid Preview */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#34495e' }}>
              Interactive Editor:
            </label>
            {grid && (
              <button className="btn btn-secondary" onClick={clearAll}>
                Clear
              </button>
            )}
          </div>
          <div
            style={{
              border: '2px solid #bdc3c7',
              borderRadius: 8,
              padding: 16,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}
          >
            {grid && gridSize.rows > 0 && gridSize.cols > 0 ? (
              <div
                className="nonogram-grid"
                style={{
                  '--rows': gridSize.rows,
                  '--cols': gridSize.cols,
                }}
                onMouseUp={handleMouseUp}
              >
                {grid.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`cell ${cell === 1 ? 'filled' : ''} ${(colIdx > 0 && colIdx % 5 === 0) ? 'thick-left' : ''} ${(rowIdx > 0 && rowIdx % 5 === 0) ? 'thick-top' : ''}`}
                      style={{
                        gridColumn: colIdx + 1,
                        gridRow: rowIdx + 1
                      }}
                      onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                      onMouseOver={() => handleMouseOver(rowIdx, colIdx)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div style={{ color: '#95a5a6', textAlign: 'center' }}>
                No matrix to preview
                <br />
                <small>Generate a nonogram to start editing</small>
              </div>
            )}
          </div>
        </div>

        {/* Read-only matrix text reflecting current grid */}
        {grid && gridSize.rows > 0 && gridSize.cols > 0 && (
          <div style={{ marginTop: 24 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#34495e', marginBottom: 8 }}>
              Matrix (read-only):
            </label>
            <textarea
              value={matrixText}
              readOnly
              style={{
                width: '100%',
                minHeight: '240px',
                padding: 12,
                border: '2px solid #bdc3c7',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                background: '#f8f9fa',
                color: '#2c3e50',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
