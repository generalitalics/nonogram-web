/**
 * Save user progress to backend
 * Backend will handle: user_id lookup by username, level_id lookup by level number and difficulty
 * Backend will determine status based on reason:
 *   - 'completed' → status = 'completed'
 *   - 'manual', 'back', 'next_level' → status = 'in_progress'
 * @param {string} username - User's username
 * @param {number} levelNumber - Puzzle level number (sequential within difficulty, 1-based)
 * @param {string} difficulty - Difficulty level ('Easy', 'Medium', 'Hard')
 * @param {Array<Array<number>>} matrix - Current grid state (0s and 1s only)
 * @param {string} reason - Reason for saving: 'manual', 'back', 'next_level', 'completed'
 * @returns {Promise<Object>} Response from backend
 */
export const saveProgress = async (username, levelNumber, difficulty, matrix, reason) => {
  const requestData = {
    username,
    level: levelNumber, // Sequential level number within difficulty (1, 2, 3...)
    difficulty: difficulty.toLowerCase(), // 'easy', 'medium', 'hard'
    matrix, // 2D array of 0s and 1s
    reason, // 'manual', 'back', 'next_level', 'completed'
  };

  // Log request for debugging
  console.log('📤 Saving progress to backend:', {
    url: '/api/progress/save',
    method: 'POST',
    data: {
      ...requestData,
      matrix: `[${matrix.length}x${matrix[0]?.length || 0} array]`, // Log size instead of full array
    },
  });

  try {
    const response = await fetch('/api/progress/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Failed to save progress';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
        console.error('❌ Backend error:', errorData);
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
        const errorText = await response.text();
        console.error('❌ Backend error (text):', errorText);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Progress saved successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error saving progress:', error);
    throw error;
  }
};

/**
 * Quick check if user has progress for a specific level (without matrix)
 * @param {string} username - User's username
 * @param {number} levelNumber - Puzzle level number (sequential within difficulty, 1-based)
 * @param {string} difficulty - Difficulty level ('Easy', 'Medium', 'Hard')
 * @returns {Promise<Object>} { has_progress: boolean }
 */
export const checkProgress = async (username, levelNumber, difficulty) => {
  const url = `/api/progress/check?username=${encodeURIComponent(username)}&difficulty=${encodeURIComponent(difficulty.toLowerCase())}&level=${levelNumber}`;
  
  console.log('🔍 Quick check progress:', {
    url,
    username,
    level: levelNumber,
    difficulty: difficulty.toLowerCase(),
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('📥 Check progress response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ No progress found (check)');
        return { has_progress: false };
      }
      let errorMessage = 'Failed to check progress';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
        console.error('❌ Backend error:', errorData);
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Progress check result:', data);
    return data;
  } catch (error) {
    console.error('❌ Error checking progress:', error);
    // Return default on error - no progress
    return { has_progress: false };
  }
};

/**
 * Load user progress for a specific level from backend (with matrix)
 * @param {string} username - User's username
 * @param {number} levelNumber - Puzzle level number (sequential within difficulty, 1-based)
 * @param {string} difficulty - Difficulty level ('Easy', 'Medium', 'Hard')
 * @returns {Promise<Object>} { has_progress: boolean, matrix: Array<Array<number>>|null }
 */
export const loadProgress = async (username, levelNumber, difficulty) => {
  const url = `/api/progress/load?username=${encodeURIComponent(username)}&difficulty=${encodeURIComponent(difficulty.toLowerCase())}&level=${levelNumber}`;
  
  console.log('📥 Loading progress from backend:', {
    url,
    username,
    level: levelNumber,
    difficulty: difficulty.toLowerCase(),
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('📥 Load progress response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ No progress found for this level');
        return { has_progress: false, matrix: null };
      }
      let errorMessage = 'Failed to load progress';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
        console.error('❌ Backend error:', errorData);
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Progress loaded:', {
      has_progress: data.has_progress,
      matrix_size: data.matrix ? `[${data.matrix.length}x${data.matrix[0]?.length || 0}]` : 'null',
    });
    return data;
  } catch (error) {
    console.error('❌ Error loading progress:', error);
    // Return default on error - no progress
    return { has_progress: false, matrix: null };
  }
};

