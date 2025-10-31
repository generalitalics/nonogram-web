import React from 'react';

function DifficultySelect({ onSelectDifficulty, onOpenAdmin }) {
  return (
    <div className="level-select" style={{ position: 'relative' }}>
      <button
        className="btn-admin"
        onClick={onOpenAdmin}
        style={{ position: 'absolute', right: 0, top: 0 }}
      >
        Admin
      </button>
      <h1>🎨 Nonograms</h1>
      <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '40px' }}>
        Choose difficulty
      </p>
      <div className="difficulty-grid">
        <div 
          className="difficulty-card easy"
          onClick={() => onSelectDifficulty('Easy')}
        >
          <div className="difficulty-icon">😊</div>
          <h2>Easy</h2>
          <p>7×7 grids</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Start here!</p>
        </div>
        
        <div 
          className="difficulty-card medium"
          onClick={() => onSelectDifficulty('Medium')}
        >
          <div className="difficulty-icon">🤔</div>
          <h2>Medium</h2>
          <p>12×12 grids</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Perfect challenge</p>
        </div>
        
        <div 
          className="difficulty-card hard"
          onClick={() => onSelectDifficulty('Hard')}
        >
          <div className="difficulty-icon">🔥</div>
          <h2>Hard</h2>
          <p>20×20 grids</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Expert mode</p>
        </div>
      </div>
    </div>
  );
}

export default DifficultySelect;

