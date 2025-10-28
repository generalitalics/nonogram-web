// Local storage helpers for nonogram progress
const STORAGE_KEY = 'nonogramProgress';

export const getCompletedLevels = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return {};
  }
};

export const markLevelCompleted = (levelId) => {
  try {
    const completed = getCompletedLevels();
    completed[levelId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const isLevelCompleted = (levelId) => {
  const completed = getCompletedLevels();
  return !!completed[levelId];
};

export const unmarkLevelCompleted = (levelId) => {
  try {
    const completed = getCompletedLevels();
    delete completed[levelId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

