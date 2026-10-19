/**
 * Multiplayer Data Contracts for iBlokYou Four-Player Online Game.
 */

import { BoardCell, Piece, PolyominoShape } from './game';

export type PlayerId = 'player1' | 'player2' | 'player3' | 'player4';

export interface HeldTile {
  id: string;
  originalPlayerId: PlayerId;
  pieceId: string;
  shape: PolyominoShape;
  size: number;
}

export interface RoomPlayer {
  id: PlayerId;
  sessionId: string;
  name: string;
  code: string; // e.g. "P1-8F3A"
  colorHex: string;
  colorName: string;
  role: string;
  corner: [number, number];
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  pieces: Piece[];
  heldTiles: HeldTile[];
  powerCards: {
    forceKeepUsed: boolean;
    swapUsed: boolean;
  };
  extraTurns: number;
}

export interface HostSettings {
  enableForceKeep: boolean;
  enableSwap: boolean;
  allowHostExtraTurns: boolean;
  enableTurnTimer: boolean;
  turnDurationSeconds: number;
  enableDetailedHistory: boolean;
}

export type SwapStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'counter-offered'
  | 'completed'
  | 'cancelled';

export interface SwapTerms {
  offeredPieceId: string;
  requestedPieceId: string;
  offeredTileCoord?: [number, number];
  requestedTileCoord?: [number, number];
}

export interface SwapProposal {
  id: string;
  initiatorId: PlayerId;
  recipientId: PlayerId;
  terms: SwapTerms;
  status: SwapStatus;
  waitingForPlayerId: PlayerId;
  counterTerms?: SwapTerms;
  initiatorConfirmed: boolean;
  recipientConfirmed: boolean;
  turnLocked: boolean;
  createdAt: number;
  updatedAt: number;
}

export type HistoryCategory = 'positive' | 'negative' | 'neutral';

export interface HistoryEvent {
  sequence: number;
  timestamp: number;
  playerId: PlayerId;
  playerName: string;
  playerCode: string;
  eventType:
    | 'place_tile'
    | 'force_keep'
    | 'swap_propose'
    | 'swap_accept'
    | 'swap_decline'
    | 'swap_counter'
    | 'swap_complete'
    | 'swap_cancel'
    | 'host_extra_turn'
    | 'host_pause'
    | 'host_resume'
    | 'host_rollback'
    | 'player_reconnect'
    | 'turn_timeout'
    | 'game_start';
  category: HistoryCategory;
  description: string;
  details?: Record<string, unknown>;
  snapshotIndex?: number;
}

export interface GameSnapshot {
  sequence: number;
  board: BoardCell[][];
  scores: Record<PlayerId, number>;
  playerPieces: Record<PlayerId, Piece[]>;
  playerHeldTiles: Record<PlayerId, HeldTile[]>;
  powerCards: Record<PlayerId, { forceKeepUsed: boolean; swapUsed: boolean }>;
  currentTurnPlayerId: PlayerId;
  turnTimeRemaining: number;
}

export type GameStatus = 'lobby' | 'playing' | 'paused' | 'ended';

export interface RoomState {
  roomCode: string;
  status: GameStatus;
  hostSessionId: string;
  settings: HostSettings;
  players: Record<PlayerId, RoomPlayer | null>;
  turnOrder: PlayerId[];
  currentTurnPlayerId: PlayerId;
  board: BoardCell[][];
  turnTimeRemaining: number;
  isTimerPaused: boolean;
  activeSwap: SwapProposal | null;
  history: HistoryEvent[];
  snapshots: GameSnapshot[];
  winner: PlayerId | 'consensus' | null;
  round: number;
}

// Client -> Server Messages
export type ClientMessage =
  | { type: 'join_room'; roomCode: string; playerName: string; sessionId: string }
  | { type: 'create_room'; playerName: string; sessionId: string; settings?: Partial<HostSettings> }
  | { type: 'set_ready'; ready: boolean }
  | { type: 'update_settings'; settings: Partial<HostSettings> }
  | { type: 'start_game' }
  | { type: 'place_tile'; pieceId: string; shape: PolyominoShape; row: number; col: number; rotation: number; flipped: boolean }
  | { type: 'pass_turn' }
  | { type: 'force_keep'; targetRow: number; targetCol: number }
  | { type: 'place_held_tile'; heldTileId: string; row: number; col: number }
  | { type: 'swap_propose'; recipientId: PlayerId; offeredPieceId: string; requestedPieceId: string; offeredTileCoord?: [number, number]; requestedTileCoord?: [number, number] }
  | { type: 'swap_respond'; action: 'accept' | 'decline' | 'counter'; counterTerms?: SwapTerms }
  | { type: 'swap_confirm'; confirmed: boolean }
  | { type: 'swap_cancel' }
  | { type: 'host_grant_extra_turn'; toPlayerId: PlayerId; reason?: string }
  | { type: 'host_pause' }
  | { type: 'host_resume' }
  | { type: 'host_rollback'; eventSequence: number }
  | { type: 'ping' };

// Server -> Client Messages
export type ServerMessage =
  | { type: 'room_state'; state: RoomState; yourPlayerId: PlayerId | null; isHost: boolean }
  | { type: 'error'; message: string }
  | { type: 'toast'; message: string; toastType?: 'info' | 'success' | 'warning' | 'error' }
  | { type: 'pong' };
