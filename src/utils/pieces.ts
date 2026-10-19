/**
 * Blokus polyomino pieces and geometric transformation utilities.
 * A full Blokus set contains 21 pieces totaling 89 squares.
 */

import { Piece, PolyominoShape } from '../types/game';

export const RAW_PIECES_DATA: Array<{ id: string; name: string; size: number; matrix: PolyominoShape }> = [
  // Monomino (1)
  { id: 'I1', name: 'Monomino', size: 1, matrix: [[1]] },

  // Domino (2)
  { id: 'I2', name: 'Domino', size: 2, matrix: [[1, 1]] },

  // Triominos (3)
  { id: 'I3', name: 'I-Trio', size: 3, matrix: [[1, 1, 1]] },
  {
    id: 'L3',
    name: 'Corner-Trio',
    size: 3,
    matrix: [
      [1, 0],
      [1, 1],
    ],
  },

  // Tetrominos (4)
  { id: 'I4', name: 'Straight-4', size: 4, matrix: [[1, 1, 1, 1]] },
  {
    id: 'L4',
    name: 'L-Tetro',
    size: 4,
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: 'T4',
    name: 'T-Tetro',
    size: 4,
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    id: 'O4',
    name: 'Square-4',
    size: 4,
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'Z4',
    name: 'Z-Tetro',
    size: 4,
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },

  // Pentominos (5)
  { id: 'I5', name: 'Long-5', size: 5, matrix: [[1, 1, 1, 1, 1]] },
  {
    id: 'L5',
    name: 'L-Pento',
    size: 5,
    matrix: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: 'Y5',
    name: 'Y-Pento',
    size: 5,
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  },
  {
    id: 'T5',
    name: 'T-Pento',
    size: 5,
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    id: 'U5',
    name: 'U-Pento',
    size: 5,
    matrix: [
      [1, 0, 1],
      [1, 1, 1],
    ],
  },
  {
    id: 'V5',
    name: 'Corner-5',
    size: 5,
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    id: 'W5',
    name: 'Stairs-5',
    size: 5,
    matrix: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    id: 'X5',
    name: 'Cross-5',
    size: 5,
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    id: 'Z5',
    name: 'Z-Pento',
    size: 5,
    matrix: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    id: 'F5',
    name: 'Branch-5',
    size: 5,
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    id: 'P5',
    name: 'Block-Pento',
    size: 5,
    matrix: [
      [1, 1],
      [1, 1],
      [1, 0],
    ],
  },
  {
    id: 'N5',
    name: 'Hook-Pento',
    size: 5,
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  },
];

export function createInitialPieces(): Piece[] {
  return RAW_PIECES_DATA.map((p) => ({
    ...p,
    used: false,
  }));
}

/**
 * Rotate matrix 90 degrees clockwise
 */
export function rotateMatrix(matrix: PolyominoShape): PolyominoShape {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: PolyominoShape = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

/**
 * Flip matrix horizontally
 */
export function flipMatrix(matrix: PolyominoShape): PolyominoShape {
  return matrix.map((row) => [...row].reverse());
}

/**
 * Apply rotation (0, 90, 180, 270) and flip to a matrix
 */
export function transformMatrix(
  matrix: PolyominoShape,
  rotation: number,
  flipped: boolean
): PolyominoShape {
  let res = matrix.map((row) => [...row]);
  if (flipped) {
    res = flipMatrix(res);
  }
  const times = ((rotation % 360) + 360) % 360 / 90;
  for (let i = 0; i < times; i++) {
    res = rotateMatrix(res);
  }
  return res;
}
