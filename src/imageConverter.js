// Simple image pattern converter to nonogram
export const convertImageToNonogram = (imageRows) => {
  const rows = imageRows.length;
  const cols = imageRows[0].length;
  
  // Convert to solution grid
  const solution = imageRows.map(row => 
    row.map(char => char === 'X' || char === 'x' || char === '#' ? 1 : 0)
  );
  
  // Generate row clues
  const rowClues = imageRows.map(row => {
    const clue = [];
    let currentGroup = 0;
    
    for (let i = 0; i < row.length; i++) {
      const isFilled = row[i] === 'X' || row[i] === 'x' || row[i] === '#';
      
      if (isFilled) {
        currentGroup++;
      } else {
        if (currentGroup > 0) {
          clue.push(currentGroup);
          currentGroup = 0;
        }
      }
    }
    
    if (currentGroup > 0) {
      clue.push(currentGroup);
    }
    
    return clue.length > 0 ? clue : [0];
  });
  
  // Generate column clues
  const colClues = [];
  for (let col = 0; col < cols; col++) {
    const clue = [];
    let currentGroup = 0;
    
    for (let row = 0; row < rows; row++) {
      const isFilled = solution[row][col] === 1;
      
      if (isFilled) {
        currentGroup++;
      } else {
        if (currentGroup > 0) {
          clue.push(currentGroup);
          currentGroup = 0;
        }
      }
    }
    
    if (currentGroup > 0) {
      clue.push(currentGroup);
    }
    
    colClues.push(clue.length > 0 ? clue : [0]);
  }
  
  return { rows, cols, rowClues, colClues, solution };
};

// Define image patterns
export const imagePatterns = {
  heart: [
    '.X.X.X.',
    'X.X.X.X',
    'X...X.X',
    '.X.X.X.',
    '..X.X..',
    '...X...',
    '...'
  ],
  
  house: [
    '...#...',
    '..#.#..',
    '.#...#.',
    '#.....#',
    '#######',
    '#..#..#',
    '#..#..#',
    '#######'
  ],
  
  star: [
    '..#...#',
    '...#...',
    '#######',
    '.##.##.',
    '..#.##.',
    '.####..',
    '..#..#.'
  ]
};

