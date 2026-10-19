/**
 * Blokus game rules engine and board evaluation.
 */

import { BoardCell, PlayerId, PolyominoShape } from '../types/game';

export const BOARD_SIZE = 20;

export const PLAYER_CORNERS: Record<PlayerId, [number, number]> = {
  player1: [0, 0], // Top-Left (Red)
  player2: [0, 19], // Top-Right (Blue)
  player3: [19, 0], // Bottom-Left (Green)
  player4: [19, 19], // Bottom-Right (Yellow)
};

export function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      playerId: null,
    }))
  );
}

/**
 * Check if placing shape at (startRow, startCol) is valid according to Blokus rules.
 */
export function isValidBlokusPlacement(
  board: BoardCell[][],
  shape: PolyominoShape,
  startRow: number,
  startCol: number,
  playerId: PlayerId,
  isFirstMove: boolean
): { valid: boolean; reason?: string } {
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;

  const targetCorner = PLAYER_CORNERS[playerId];
  let coversStartingCorner = false;
  let hasCornerContactWithSameColor = false;

  // 1. Check bounds and overlap
  for (let r = 0; r < shapeRows; r++) {
    for (let c = 0; c < shapeCols; c++) {
      if (shape[r][c] === 1) {
        const boardR = startRow + r;
        const boardC = startCol + c;

        // Check board bounds
        if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE) {
          return { valid: false, reason: 'Out of board bounds' };
        }

        // Check overlap
        if (board[boardR][boardC].playerId !== null) {
          return { valid: false, reason: 'Tile overlaps an occupied square' };
        }

        // Check if covers start corner
        if (boardR === targetCorner[0] && boardC === targetCorner[1]) {
          coversStartingCorner = true;
        }

        // 2. Check edge-to-edge contact with SAME color (FORBIDDEN)
        const orthogonalNeighbors = [
          [boardR - 1, boardC],
          [boardR + 1, boardC],
          [boardR, boardC - 1],
          [boardR, boardC + 1],
        ];

        for (const [nr, nc] of orthogonalNeighbors) {
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (board[nr][nc].playerId === playerId) {
              return { valid: false, reason: 'Cannot touch pieces of the same color edge-to-edge' };
            }
          }
        }

        // 3. Check diagonal corner-to-corner contact with SAME color (REQUIRED for subsequent moves)
        const diagonalNeighbors = [
          [boardR - 1, boardC - 1],
          [boardR - 1, boardC + 1],
          [boardR + 1, boardC - 1],
          [boardR + 1, boardC + 1],
        ];

        for (const [dr, dc] of diagonalNeighbors) {
          if (dr >= 0 && dr < BOARD_SIZE && dc >= 0 && dc < BOARD_SIZE) {
            if (board[dr][dc].playerId === playerId) {
              hasCornerContactWithSameColor = true;
            }
          }
        }
      }
    }
  }

  // First move must cover the player's corner
  if (isFirstMove) {
    if (!coversStartingCorner) {
      return { valid: false, reason: `First move must cover your starting corner at (${targetCorner[0]}, ${targetCorner[1]})` };
    }
    return { valid: true };
  }

  // Subsequent moves must touch at least one corner of the player's own color
  if (!hasCornerContactWithSameColor) {
    return { valid: false, reason: 'Must connect corner-to-corner with at least one of your own tiles' };
  }

  return { valid: true };
}

/**
 * Apply a piece onto the board
 */
export function applyPieceToBoard(
  board: BoardCell[][],
  shape: PolyominoShape,
  startRow: number,
  startCol: number,
  playerId: PlayerId,
  pieceId: string,
  stepIndex: number,
  isConflict: boolean = false
): BoardCell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c] === 1) {
        newBoard[startRow + r][startCol + c] = {
          playerId,
          pieceId,
          placedAtStep: stepIndex,
          isConflictSpot: isConflict,
          isHighlighted: isConflict,
        };
      }
    }
  }
  return newBoard;
}

/**
 * Get occupied cells list for a shape placed at (startRow, startCol)
 */
export function getShapeCells(
  shape: PolyominoShape,
  startRow: number,
  startCol: number
): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c] === 1) {
        cells.push([startRow + r, startCol + c]);
      }
    }
  }
  return cells;
}

/**
 * Calculate all legal placement origins for a given piece on the board.
 * Returns array of [row, col] where placing shape is 100% legal according to Blokus rules.
 */
export function calculateLegalPlacements(
  board: BoardCell[][],
  shape: PolyominoShape,
  playerId: PlayerId,
  isFirstMove: boolean
): [number, number][] {
  const legalOrigins: [number, number][] = [];
  const maxR = BOARD_SIZE - shape.length;
  const maxC = BOARD_SIZE - shape[0].length;

  for (let r = 0; r <= maxR; r++) {
    for (let c = 0; c <= maxC; c++) {
      if (isValidBlokusPlacement(board, shape, r, c, playerId, isFirstMove).valid) {
        legalOrigins.push([r, c]);
      }
    }
  }
  return legalOrigins;
}

