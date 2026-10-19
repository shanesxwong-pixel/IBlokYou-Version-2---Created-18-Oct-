/**
 * Types for the iBlokYou game, politeness token mechanics, and narrative simulation.
 */

export type PlayerId = 'player1' | 'player2' | 'player3' | 'player4';

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  role: string; // "PERSECUTOR", "VICTIM", "RESCUER", "ALLY"
  colorName: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  avatar: string;
  personality: string;
  playStyle: string;
  corner: [number, number]; // [row, col]
  politenessTokens: number; // starts at 3; deductions for unassertive or aggressive taunts
  faceSavingStrategyApplied?: boolean;
}

export type PolyominoShape = number[][]; // 2D matrix (1 for filled, 0 for empty)

export interface Piece {
  id: string;
  name: string;
  size: number; // number of squares (1 to 5)
  matrix: PolyominoShape;
  used: boolean;
}

export interface BoardCell {
  playerId: PlayerId | null;
  pieceId?: string;
  isConflictSpot?: boolean;
  isHighlighted?: boolean;
  placedAtStep?: number;
}

export type GameStage = 
  | 'setup'       // Scissors-Paper-Stone & player intros
  | 'round1'      // 0 to 30 points: The Spark of Conflict
  | 'round2'      // 30 to 50 points: Deepening Conflict & 3-Corner Power Cards
  | 'round3'      // 50+ points: Liam's Differential Strategy & Face-Saving Consensus
  | 'consensus';  // Victory reached! All players >= 50 points

export interface StoryDialogue {
  speakerId: PlayerId | 'narrator';
  speakerName: string;
  text: string;
  emotion: 'aggressive' | 'shy' | 'assertive' | 'cooperative' | 'neutral' | 'triumphant' | 'face-saving';
  highlightCells?: [number, number][];
  politenessNote?: string;
}

export interface ScriptedStep {
  stepIndex: number;
  stage: GameStage;
  stageTitle: string;
  playerId: PlayerId;
  pieceId: string;
  row: number;
  col: number;
  rotation: number; // 0, 90, 180, 270
  flipped: boolean;
  scoreAfter: Record<PlayerId, number>;
  narrativeNote?: string;
  dialogue?: StoryDialogue;
  isConflictTrigger?: boolean;
  isPowerCardEvent?: boolean;
  powerCardName?: 'Change Swap' | 'Force Keep' | 'Touch-Me-Not';
  timestampStr: string; // e.g. "02:40"
  politenessDelta?: { playerId: PlayerId; change: number; reason: string };
}

export interface PowerCard {
  id: 'change-swap' | 'force-keep' | 'touch-me-not';
  name: string;
  subtitle: string;
  description: string;
  usageCount: number;
  maxUsage: number;
  badge: string;
}

export interface PlaytestTimestamp {
  timestamp: string;
  stageName: string;
  description: string;
  category: 'setup' | 'choice' | 'conflict' | 'creator' | 'consensus';
}
