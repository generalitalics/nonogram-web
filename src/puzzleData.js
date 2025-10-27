// Sample nonogram puzzle data
// Easy: 7x7, Medium: 12x12, Hard: 20x20

// 7x7 Heart
const heart7x7 = [
  [0, 1, 0, 1, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [1, 1, 0, 1, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0]
];

// 12x12 Smiley Face
const smiley12x12 = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,0,1,1,1,1,1,0,1,1,1],
  [1,1,0,1,1,1,1,1,0,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,0,0,0,0,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0]
];

// Helper function to generate clues from solution
function generateClues(solution) {
  const rows = solution.length;
  const cols = solution[0].length;
  
  // Row clues
  const rowClues = [];
  for (let i = 0; i < rows; i++) {
    const clue = [];
    let count = 0;
    for (let j = 0; j < cols; j++) {
      if (solution[i][j] === 1) {
        count++;
      } else if (count > 0) {
        clue.push(count);
        count = 0;
      }
    }
    if (count > 0) {
      clue.push(count);
    }
    rowClues.push(clue.length > 0 ? clue : [0]);
  }
  
  // Column clues
  const colClues = [];
  for (let j = 0; j < cols; j++) {
    const clue = [];
    let count = 0;
    for (let i = 0; i < rows; i++) {
      if (solution[i][j] === 1) {
        count++;
      } else if (count > 0) {
        clue.push(count);
        count = 0;
      }
    }
    if (count > 0) {
      clue.push(count);
    }
    colClues.push(clue.length > 0 ? clue : [0]);
  }
  
  return { rowClues, colClues };
}

// Add more solutions here as needed
const arrow7x7 = [
  [0,0,1,0,0,0,0],
  [0,1,1,0,1,0,0],
  [1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1],
  [1,1,1,0,1,1,0],
  [0,1,1,0,1,0,0],
  [0,0,1,0,0,0,0]
];

const star7x7 = [
  [0,0,1,0,0,1,0],
  [0,1,1,0,1,1,0],
  [1,1,1,1,1,1,1],
  [0,1,1,1,1,1,0],
  [1,1,1,1,1,1,1],
  [0,1,1,0,1,1,0],
  [0,0,1,0,0,1,0]
];

const arrow12x12 = [
  [0,0,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,0,0,0,0],
  [0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0]
];

// Helper to create empty 20x20 grid
function create20x20() {
  return Array(20).fill(null).map(() => Array(20).fill(0));
}

// 20x20 Triangle
const triangle20x20 = create20x20();
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < 20 - i; j++) {
    if (i < 10) {
      triangle20x20[i][j + i] = 1;
    }
  }
}

// 20x20 Butterfly pattern
const butterfly20x20 = create20x20();
// Wings
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 8; j++) {
    if ((i + j) < 8 || (i + (19 - j)) < 8) {
      butterfly20x20[i][j] = 1;
      butterfly20x20[i][19 - j] = 1;
    }
  }
}
// Body
for (let i = 5; i < 15; i++) {
  butterfly20x20[i][9] = 1;
  butterfly20x20[i][10] = 1;
}
// Lower wings
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 10; j++) {
    if ((i + j) < 8) {
      butterfly20x20[12 + i][j] = 1;
      butterfly20x20[12 + i][19 - j] = 1;
    }
  }
}

const heartData = generateClues(heart7x7);
const arrow7Data = generateClues(arrow7x7);
const star7Data = generateClues(star7x7);
const smileyData = generateClues(smiley12x12);
const arrow12Data = generateClues(arrow12x12);
const triangleData = generateClues(triangle20x20);
const butterflyData = generateClues(butterfly20x20);

export const puzzles = {
  // Easy 7x7
  1: {
    id: 1,
    name: "Heart",
    difficulty: "Easy",
    rows: 7,
    cols: 7,
    rowClues: heartData.rowClues,
    colClues: heartData.colClues,
    solution: heart7x7
  },
  2: {
    id: 2,
    name: "Arrow",
    difficulty: "Easy",
    rows: 7,
    cols: 7,
    rowClues: arrow7Data.rowClues,
    colClues: arrow7Data.colClues,
    solution: arrow7x7
  },
  3: {
    id: 3,
    name: "Star",
    difficulty: "Easy",
    rows: 7,
    cols: 7,
    rowClues: star7Data.rowClues,
    colClues: star7Data.colClues,
    solution: star7x7
  },
  // Medium 12x12
  4: {
    id: 4,
    name: "Smiley",
    difficulty: "Medium",
    rows: 12,
    cols: 12,
    rowClues: smileyData.rowClues,
    colClues: smileyData.colClues,
    solution: smiley12x12
  },
  5: {
    id: 5,
    name: "Arrow",
    difficulty: "Medium",
    rows: 12,
    cols: 12,
    rowClues: arrow12Data.rowClues,
    colClues: arrow12Data.colClues,
    solution: arrow12x12
  },
  // Hard 20x20
  6: {
    id: 6,
    name: "Triangle",
    difficulty: "Hard",
    rows: 20,
    cols: 20,
    rowClues: triangleData.rowClues,
    colClues: triangleData.colClues,
    solution: triangle20x20
  },
  7: {
    id: 7,
    name: "Butterfly",
    difficulty: "Hard",
    rows: 20,
    cols: 20,
    rowClues: butterflyData.rowClues,
    colClues: butterflyData.colClues,
    solution: butterfly20x20
  }
};
