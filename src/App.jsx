import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Login from './components/Login';
import DifficultySelect from './components/DifficultySelect';
import LevelSelect from './components/LevelSelect';
import Puzzle from './components/Puzzle';
import Admin from './components/Admin';
import { puzzles } from './puzzleData';
import { markLevelCompleted } from './utils/localStorage';

// Protected Route wrapper
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Login page component
function LoginPage({ onLogin, isAuthenticated }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/difficulty', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (username) => {
    onLogin(username);
    navigate('/difficulty', { replace: true });
  };

  if (isAuthenticated) {
    return null;
  }

  return <Login onLogin={handleLogin} />;
}

// Difficulty select page
function DifficultySelectPage({ onLogout }) {
  const navigate = useNavigate();
  
  return (
    <DifficultySelect 
      onSelectDifficulty={(difficulty) => {
        navigate(`/difficulty/${difficulty.toLowerCase()}`);
      }}
      onOpenAdmin={() => {
        navigate('/admin');
      }}
      onLogout={onLogout}
    />
  );
}

// Level select page with route params
function LevelSelectPage({ puzzles, onLogout }) {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  
  // Convert URL param to proper case
  const difficultyFormatted = difficulty 
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : null;

  if (!difficultyFormatted || !['Easy', 'Medium', 'Hard'].includes(difficultyFormatted)) {
    return <Navigate to="/difficulty" replace />;
  }

  return (
    <LevelSelect
      puzzles={puzzles}
      difficulty={difficultyFormatted}
      onSelectLevel={(levelId) => {
        // Find level number for this puzzle
        const filtered = Object.values(puzzles)
          .filter(p => p.difficulty === difficultyFormatted)
          .sort((a, b) => a.id - b.id);
        const levelNumber = filtered.findIndex(p => p.id === levelId) + 1;
        navigate(`/puzzle/${difficulty}/${levelNumber}`);
      }}
      onBack={() => navigate('/difficulty')}
      onLogout={onLogout}
    />
  );
}

// Puzzle page with route params
function PuzzlePage({ puzzles, onLogout }) {
  const { difficulty, level } = useParams();
  const navigate = useNavigate();
  
  // Convert URL param to proper case
  const difficultyFormatted = difficulty 
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : null;
  const levelNumber = level ? parseInt(level, 10) : null;

  if (!difficultyFormatted || !['Easy', 'Medium', 'Hard'].includes(difficultyFormatted) || !levelNumber) {
    return <Navigate to="/difficulty" replace />;
  }

  // Find puzzle by difficulty and level number
  const filtered = Object.values(puzzles)
    .filter(p => p.difficulty === difficultyFormatted)
    .sort((a, b) => a.id - b.id);
  
  const puzzle = filtered[levelNumber - 1];

  if (!puzzle) {
    return <Navigate to={`/difficulty/${difficulty}`} replace />;
  }

  const handleNextLevel = () => {
    const nextLevelNumber = levelNumber + 1;
    if (nextLevelNumber <= filtered.length) {
      navigate(`/puzzle/${difficulty}/${nextLevelNumber}`);
    } else {
      navigate(`/difficulty/${difficulty}`);
    }
  };

  return (
    <Puzzle
      puzzle={puzzle}
      difficulty={difficultyFormatted}
      onBack={() => navigate(`/difficulty/${difficulty}`)}
      onSolved={(levelId) => markLevelCompleted(levelId)}
      onNextLevel={handleNextLevel}
      username={localStorage.getItem('currentUser')}
    />
  );
}

// Admin page
function AdminPage({ onLogout }) {
  const navigate = useNavigate();
  return <Admin onClose={() => navigate('/difficulty')} onLogout={onLogout} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', username);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Navigation will be handled by ProtectedRoute redirect
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Public route - Login */}
          <Route 
            path="/" 
            element={
              <LoginPage 
                onLogin={handleLogin} 
                isAuthenticated={isAuthenticated}
              />
            } 
          />
          
          {/* Protected routes */}
          <Route
            path="/difficulty"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DifficultySelectPage 
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/difficulty/:difficulty"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <LevelSelectPage 
                  puzzles={puzzles}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/puzzle/:difficulty/:level"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <PuzzlePage 
                  puzzles={puzzles}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminPage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
