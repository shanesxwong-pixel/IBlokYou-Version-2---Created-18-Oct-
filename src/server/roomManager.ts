/**
 * Authoritative Server Room Manager for iBlokYou 4-Player Multiplayer.
 */

import { WebSocket } from 'ws';
import {
  PlayerId,
  RoomState,
  RoomPlayer,
  HostSettings,
  ClientMessage,
  ServerMessage,
  SwapProposal,
  SwapTerms,
  GameSnapshot,
  HistoryEvent,
  HeldTile,
} from '../types/multiplayer';
import { createEmptyBoard, isValidBlokusPlacement, applyPieceToBoard, BOARD_SIZE } from '../utils/blokusLogic';
import { createInitialPieces, RAW_PIECES_DATA, transformMatrix } from '../utils/pieces';

export const PLAYER_CONFIGS: Record<PlayerId, { colorHex: string; colorName: string; role: string; corner: [number, number] }> = {
  player1: {
    colorHex: '#2563eb',
    colorName: 'Cobalt Blue',
    role: 'Player 1',
    corner: [0, 0],
  },
  player2: {
    colorHex: '#eab308',
    colorName: 'Amber Yellow',
    role: 'Player 2',
    corner: [0, 19],
  },
  player3: {
    colorHex: '#dc2626',
    colorName: 'Ruby Red',
    role: 'Player 3',
    corner: [19, 0],
  },
  player4: {
    colorHex: '#16a34a',
    colorName: 'Emerald Green',
    role: 'Player 4',
    corner: [19, 19],
  },
};

const DEFAULT_SETTINGS: HostSettings = {
  enableForceKeep: true,
  enableSwap: true,
  allowHostExtraTurns: true,
  enableTurnTimer: true,
  turnDurationSeconds: 60,
  enableDetailedHistory: true,
};

interface ConnectedClient {
  ws: WebSocket;
  sessionId: string;
  roomCode: string;
}

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  private clients: Map<WebSocket, ConnectedClient> = new Map();
  private timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start authoritative timer ticker
    this.timerInterval = setInterval(() => this.tickTimers(), 1000);
  }

  public cleanup() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  public registerClient(ws: WebSocket) {
    ws.on('message', (data) => {
      try {
        const msg: ClientMessage = JSON.parse(data.toString());
        this.handleClientMessage(ws, msg);
      } catch (err) {
        this.sendError(ws, 'Malformed message received');
      }
    });

    ws.on('close', () => {
      this.handleClientDisconnect(ws);
    });
  }

  private handleClientDisconnect(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return;

    const room = this.rooms.get(client.roomCode);
    if (room) {
      // Find player with this session
      for (const pid of room.turnOrder) {
        const p = room.players[pid];
        if (p && p.sessionId === client.sessionId) {
          p.isConnected = false;
          this.logHistory(
            room,
            pid,
            'player_reconnect',
            'neutral',
            `${p.name} disconnected from room`
          );
          break;
        }
      }

      this.broadcastRoomState(room);
    }

    this.clients.delete(ws);
  }

  private handleClientMessage(ws: WebSocket, msg: ClientMessage) {
    switch (msg.type) {
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;

      case 'create_room':
        this.handleCreateRoom(ws, msg.playerName, msg.sessionId, msg.settings);
        break;

      case 'join_room':
        this.handleJoinRoom(ws, msg.roomCode, msg.playerName, msg.sessionId);
        break;

      case 'set_ready':
        this.handleSetReady(ws, msg.ready);
        break;

      case 'update_settings':
        this.handleUpdateSettings(ws, msg.settings);
        break;

      case 'start_game':
        this.handleStartGame(ws);
        break;

      case 'place_tile':
        this.handlePlaceTile(ws, msg);
        break;

      case 'pass_turn':
        this.handlePassTurn(ws);
        break;

      case 'force_keep':
        this.handleForceKeep(ws, msg.targetRow, msg.targetCol);
        break;

      case 'place_held_tile':
        this.handlePlaceHeldTile(ws, msg.heldTileId, msg.row, msg.col);
        break;

      case 'swap_propose':
        this.handleSwapPropose(ws, msg);
        break;

      case 'swap_respond':
        this.handleSwapRespond(ws, msg.action, msg.counterTerms);
        break;

      case 'swap_confirm':
        this.handleSwapConfirm(ws, msg.confirmed);
        break;

      case 'swap_cancel':
        this.handleSwapCancel(ws);
        break;

      case 'host_grant_extra_turn':
        this.handleHostGrantExtraTurn(ws, msg.toPlayerId, msg.reason);
        break;

      case 'host_pause':
        this.handleHostPause(ws);
        break;

      case 'host_resume':
        this.handleHostResume(ws);
        break;

      case 'host_rollback':
        this.handleHostRollback(ws, msg.eventSequence);
        break;

      default:
        break;
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }

  private generatePlayerCode(playerId: PlayerId): string {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = playerId === 'player1' ? 'P1' : playerId === 'player2' ? 'P2' : playerId === 'player3' ? 'P3' : 'P4';
    return `${prefix}-${rand}`;
  }

  private handleCreateRoom(
    ws: WebSocket,
    playerName: string,
    sessionId: string,
    customSettings?: Partial<HostSettings>
  ) {
    const roomCode = this.generateRoomCode();
    const cleanName = (playerName || 'Player 1').trim().substring(0, 20);

    const hostPlayer: RoomPlayer = {
      id: 'player1',
      sessionId,
      name: cleanName,
      code: this.generatePlayerCode('player1'),
      colorHex: PLAYER_CONFIGS.player1.colorHex,
      colorName: PLAYER_CONFIGS.player1.colorName,
      role: PLAYER_CONFIGS.player1.role,
      corner: PLAYER_CONFIGS.player1.corner,
      isHost: true,
      isReady: true,
      isConnected: true,
      score: 0,
      pieces: createInitialPieces(),
      heldTiles: [],
      powerCards: { forceKeepUsed: false, swapUsed: false },
      extraTurns: 0,
    };

    const room: RoomState = {
      roomCode,
      status: 'lobby',
      hostSessionId: sessionId,
      settings: { ...DEFAULT_SETTINGS, ...customSettings },
      players: {
        player1: hostPlayer,
        player2: null,
        player3: null,
        player4: null,
      },
      turnOrder: ['player1', 'player2', 'player3', 'player4'],
      currentTurnPlayerId: 'player1',
      board: createEmptyBoard(),
      turnTimeRemaining: DEFAULT_SETTINGS.turnDurationSeconds,
      isTimerPaused: false,
      activeSwap: null,
      history: [],
      snapshots: [],
      winner: null,
      round: 1,
    };

    this.rooms.set(roomCode, room);
    this.clients.set(ws, { ws, sessionId, roomCode });

    this.logHistory(room, 'player1', 'game_start', 'neutral', `Room ${roomCode} created by ${cleanName}`);
    this.broadcastRoomState(room);
  }

  private handleJoinRoom(ws: WebSocket, roomCode: string, playerName: string, sessionId: string) {
    const normalizedCode = (roomCode || '').toUpperCase().trim();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      this.sendError(ws, `Room "${normalizedCode}" not found. Please check code or create new.`);
      return;
    }

    const cleanName = (playerName || 'Player').trim().substring(0, 20);

    // 1. Check if user is reconnecting
    for (const pid of room.turnOrder) {
      const existing = room.players[pid];
      if (existing && existing.sessionId === sessionId) {
        existing.isConnected = true;
        if (cleanName && cleanName !== 'Player') {
          existing.name = cleanName;
        }
        this.clients.set(ws, { ws, sessionId, roomCode: normalizedCode });
        this.logHistory(room, pid, 'player_reconnect', 'positive', `${existing.name} reconnected`);
        this.broadcastRoomState(room);
        return;
      }
    }

    // 2. If room already playing, don't allow brand new players to displace slots
    if (room.status !== 'lobby') {
      this.sendError(ws, 'This game has already started. Reconnection requires valid session.');
      return;
    }

    // 3. Find first open slot
    const openSlot = room.turnOrder.find((pid) => room.players[pid] === null);
    if (!openSlot) {
      this.sendError(ws, 'Room is full (maximum 4 players reached).');
      return;
    }

    const cfg = PLAYER_CONFIGS[openSlot];
    const newPlayer: RoomPlayer = {
      id: openSlot,
      sessionId,
      name: cleanName || cfg.role,
      code: this.generatePlayerCode(openSlot),
      colorHex: cfg.colorHex,
      colorName: cfg.colorName,
      role: cfg.role,
      corner: cfg.corner,
      isHost: room.hostSessionId === sessionId,
      isReady: false,
      isConnected: true,
      score: 0,
      pieces: createInitialPieces(),
      heldTiles: [],
      powerCards: { forceKeepUsed: false, swapUsed: false },
      extraTurns: 0,
    };

    room.players[openSlot] = newPlayer;
    this.clients.set(ws, { ws, sessionId, roomCode: normalizedCode });

    this.logHistory(room, openSlot, 'game_start', 'positive', `${newPlayer.name} joined as ${cfg.role} (${cfg.colorName})`);
    this.broadcastRoomState(room);
  }

  private handleSetReady(ws: WebSocket, ready: boolean) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (room.status !== 'lobby') return;
    player.isReady = ready;
    this.broadcastRoomState(room);
  }

  private handleUpdateSettings(ws: WebSocket, newSettings: Partial<HostSettings>) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!player.isHost) {
      this.sendError(ws, 'Only the host can modify game settings.');
      return;
    }

    if (room.status !== 'lobby') {
      this.sendError(ws, 'Cannot modify rules after game has started.');
      return;
    }

    room.settings = { ...room.settings, ...newSettings };
    room.turnTimeRemaining = room.settings.turnDurationSeconds;
    this.broadcastRoomState(room);
  }

  private handleStartGame(ws: WebSocket) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!player.isHost) {
      this.sendError(ws, 'Only the host can start the game.');
      return;
    }

    if (room.status !== 'lobby') return;

    // Count present players
    const activePlayers = room.turnOrder.map((pid) => room.players[pid]).filter(Boolean) as RoomPlayer[];
    if (activePlayers.length < 2) {
      this.sendError(ws, 'Need at least 2 players to start game.');
      return;
    }

    room.status = 'playing';
    room.currentTurnPlayerId = 'player1';
    room.turnTimeRemaining = room.settings.turnDurationSeconds;

    this.saveSnapshot(room);
    this.logHistory(room, player.id, 'game_start', 'positive', `Host started the 4-player game session!`);
    this.broadcastRoomState(room);
  }

  private handlePlaceTile(
    ws: WebSocket,
    msg: { pieceId: string; shape: number[][]; row: number; col: number; rotation: number; flipped: boolean }
  ) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (room.status !== 'playing') {
      this.sendError(ws, 'Game is not currently active.');
      return;
    }

    if (room.currentTurnPlayerId !== player.id) {
      this.sendError(ws, "It is not your turn to play.");
      return;
    }

    // Check turn locking (Swap negotiation must finish!)
    if (room.activeSwap && room.activeSwap.turnLocked) {
      this.sendError(ws, 'Turn is locked: Pending Swap negotiation must finish first.');
      return;
    }

    // Validate piece ownership
    const piece = player.pieces.find((p) => p.id === msg.pieceId);
    if (!piece || piece.used) {
      this.sendError(ws, 'Piece is not available in your tray.');
      return;
    }

    // Authoritative placement check
    const isFirstMove = player.score === 0;
    const validation = isValidBlokusPlacement(
      room.board,
      msg.shape,
      msg.row,
      msg.col,
      player.id,
      isFirstMove
    );

    if (!validation.valid) {
      this.sendError(ws, `Illegal placement: ${validation.reason}`);
      return;
    }

    // Save snapshot before mutating
    this.saveSnapshot(room);

    // Apply placement
    room.board = applyPieceToBoard(
      room.board,
      msg.shape,
      msg.row,
      msg.col,
      player.id,
      msg.pieceId,
      room.history.length
    );

    piece.used = true;
    player.score += piece.size;

    this.logHistory(
      room,
      player.id,
      'place_tile',
      'neutral',
      `${player.name} placed ${piece.name} at row ${msg.row + 1}, col ${msg.col + 1} (+${piece.size} pts)`
    );

    // Check if extra turn granted
    if (player.extraTurns > 0) {
      player.extraTurns -= 1;
      room.turnTimeRemaining = room.settings.turnDurationSeconds;
      this.logHistory(
        room,
        player.id,
        'host_extra_turn',
        'positive',
        `${player.name} took an extra turn!`
      );
    } else {
      this.advanceTurn(room);
    }

    this.checkConsensusOrEnd(room);
    this.broadcastRoomState(room);
  }

  private handlePassTurn(ws: WebSocket) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (room.status !== 'playing') return;
    if (room.currentTurnPlayerId !== player.id) {
      this.sendError(ws, "Not your turn.");
      return;
    }

    if (room.activeSwap && room.activeSwap.turnLocked) {
      this.sendError(ws, 'Turn is locked while Swap negotiation is unresolved.');
      return;
    }

    this.saveSnapshot(room);
    this.logHistory(room, player.id, 'turn_timeout', 'neutral', `${player.name} passed their turn`);
    this.advanceTurn(room);
    this.broadcastRoomState(room);
  }

  // --- FORCE KEEP POWER CARD IMPLEMENTATION ---
  private handleForceKeep(ws: WebSocket, targetRow: number, targetCol: number) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!room.settings.enableForceKeep) {
      this.sendError(ws, 'Force Keep is disabled in host settings.');
      return;
    }

    if (room.status !== 'playing' || room.currentTurnPlayerId !== player.id) {
      this.sendError(ws, 'You can only use Force Keep during your active turn.');
      return;
    }

    if (player.powerCards.forceKeepUsed) {
      this.sendError(ws, 'Force Keep card already used this match.');
      return;
    }

    // Check target cell
    if (targetRow < 0 || targetRow >= BOARD_SIZE || targetCol < 0 || targetCol >= BOARD_SIZE) {
      this.sendError(ws, 'Target coordinate is out of bounds.');
      return;
    }

    const cell = room.board[targetRow][targetCol];
    if (!cell || !cell.playerId || cell.playerId === player.id) {
      this.sendError(ws, 'Must target an opponent-occupied tile square.');
      return;
    }

    const targetPlayerId = cell.playerId;
    const targetPlayer = room.players[targetPlayerId];
    const pieceId = cell.pieceId || 'I1';

    this.saveSnapshot(room);

    // Remove single target tile square from board
    cell.playerId = null;
    cell.pieceId = undefined;
    cell.isConflictSpot = false;
    cell.isHighlighted = false;

    // Deduct 1 score from victim
    if (targetPlayer && targetPlayer.score > 0) {
      targetPlayer.score -= 1;
    }

    // Add to initiator's held inventory as monomino or captured tile
    const held: HeldTile = {
      id: `held-${Date.now()}`,
      originalPlayerId: targetPlayerId,
      pieceId,
      shape: [[1]],
      size: 1,
    };
    player.heldTiles.push(held);
    player.powerCards.forceKeepUsed = true;

    this.logHistory(
      room,
      player.id,
      'force_keep',
      'positive',
      `${player.name} activated Force Keep: captured tile at (${targetRow + 1}, ${targetCol + 1}) from ${targetPlayer?.name || targetPlayerId} for later placement`
    );

    this.broadcastRoomState(room);
  }

  private handlePlaceHeldTile(ws: WebSocket, heldTileId: string, row: number, col: number) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (room.status !== 'playing' || room.currentTurnPlayerId !== player.id) {
      this.sendError(ws, 'Can only place held tile during your active turn.');
      return;
    }

    const heldIndex = player.heldTiles.findIndex((h) => h.id === heldTileId);
    if (heldIndex === -1) {
      this.sendError(ws, 'Held tile not found.');
      return;
    }

    const held = player.heldTiles[heldIndex];

    // Check legal placement under Blokus rules for held shape
    const validation = isValidBlokusPlacement(
      room.board,
      held.shape,
      row,
      col,
      player.id,
      false
    );

    if (!validation.valid) {
      this.sendError(ws, `Cannot place held tile: ${validation.reason}`);
      return;
    }

    this.saveSnapshot(room);

    room.board = applyPieceToBoard(
      room.board,
      held.shape,
      row,
      col,
      player.id,
      'HELD',
      room.history.length
    );

    player.score += held.size;
    player.heldTiles.splice(heldIndex, 1);

    this.logHistory(
      room,
      player.id,
      'place_tile',
      'positive',
      `${player.name} deployed captured Force-Keep tile at (${row + 1}, ${col + 1}) (+${held.size} pt)`
    );

    this.advanceTurn(room);
    this.broadcastRoomState(room);
  }

  // --- SWAP POWER CARD NEGOTIATION WORKFLOW ---
  private handleSwapPropose(
    ws: WebSocket,
    msg: {
      recipientId: PlayerId;
      offeredPieceId: string;
      requestedPieceId: string;
      offeredTileCoord?: [number, number];
      requestedTileCoord?: [number, number];
    }
  ) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!room.settings.enableSwap) {
      this.sendError(ws, 'Swap cards are disabled in host settings.');
      return;
    }

    if (room.status !== 'playing' || room.currentTurnPlayerId !== player.id) {
      this.sendError(ws, 'Swap can only be initiated on your turn.');
      return;
    }

    if (player.powerCards.swapUsed) {
      this.sendError(ws, 'Swap card has already been used.');
      return;
    }

    if (msg.recipientId === player.id) {
      this.sendError(ws, 'Cannot propose swap to yourself.');
      return;
    }

    const recipient = room.players[msg.recipientId];
    if (!recipient || !recipient.isConnected) {
      this.sendError(ws, 'Recipient player is not connected.');
      return;
    }

    // Verify pieces exist
    const offeredPiece = player.pieces.find((p) => p.id === msg.offeredPieceId);
    const requestedPiece = recipient.pieces.find((p) => p.id === msg.requestedPieceId);

    if (!offeredPiece || !requestedPiece) {
      this.sendError(ws, 'Specified pieces not found in inventories.');
      return;
    }

    const terms: SwapTerms = {
      offeredPieceId: msg.offeredPieceId,
      requestedPieceId: msg.requestedPieceId,
      offeredTileCoord: msg.offeredTileCoord,
      requestedTileCoord: msg.requestedTileCoord,
    };

    const proposal: SwapProposal = {
      id: `swap-${Date.now()}`,
      initiatorId: player.id,
      recipientId: msg.recipientId,
      terms,
      status: 'pending',
      waitingForPlayerId: msg.recipientId,
      initiatorConfirmed: true,
      recipientConfirmed: false,
      turnLocked: true, // MANDATORY TURN LOCKING!
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    room.activeSwap = proposal;

    this.logHistory(
      room,
      player.id,
      'swap_propose',
      'neutral',
      `${player.name} initiated Tile Exchange via Swap Card with ${recipient.name}`
    );

    this.broadcastRoomState(room);
  }

  private handleSwapRespond(
    ws: WebSocket,
    action: 'accept' | 'decline' | 'counter',
    counterTerms?: SwapTerms
  ) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    const swap = room.activeSwap;
    if (!swap || swap.status === 'completed' || swap.status === 'cancelled') {
      this.sendError(ws, 'No active swap negotiation.');
      return;
    }

    if (swap.waitingForPlayerId !== player.id) {
      this.sendError(ws, 'Not waiting on your response for this negotiation.');
      return;
    }

    const initiator = room.players[swap.initiatorId];
    const recipient = room.players[swap.recipientId];

    if (action === 'decline') {
      swap.status = 'declined';
      swap.turnLocked = false;
      room.activeSwap = null;

      this.logHistory(
        room,
        player.id,
        'swap_decline',
        'negative',
        `${player.name} declined Swap proposal. Negotiation ended without card consumption.`
      );
    } else if (action === 'counter' && counterTerms) {
      swap.status = 'counter-offered';
      swap.counterTerms = counterTerms;
      swap.waitingForPlayerId = swap.initiatorId; // Now initiator must respond!
      swap.initiatorConfirmed = false;
      swap.recipientConfirmed = true;
      swap.updatedAt = Date.now();

      this.logHistory(
        room,
        player.id,
        'swap_counter',
        'neutral',
        `${player.name} submitted counter-offer. Awaiting confirmation from ${initiator?.name}`
      );
    } else if (action === 'accept') {
      swap.status = 'accepted';
      swap.recipientConfirmed = true;

      if (swap.initiatorConfirmed && swap.recipientConfirmed) {
        this.commitSwapTransaction(room, swap);
      } else {
        swap.waitingForPlayerId = swap.initiatorId;
        this.logHistory(
          room,
          player.id,
          'swap_accept',
          'positive',
          `${player.name} accepted terms. Awaiting final commit confirmation.`
        );
      }
    }

    this.broadcastRoomState(room);
  }

  private handleSwapConfirm(ws: WebSocket, confirmed: boolean) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    const swap = room.activeSwap;
    if (!swap) return;

    if (player.id === swap.initiatorId) {
      swap.initiatorConfirmed = confirmed;
    } else if (player.id === swap.recipientId) {
      swap.recipientConfirmed = confirmed;
    }

    if (!confirmed) {
      swap.status = 'cancelled';
      swap.turnLocked = false;
      room.activeSwap = null;
      this.logHistory(
        room,
        player.id,
        'swap_cancel',
        'negative',
        `${player.name} rejected counter-offer / cancelled swap`
      );
    } else if (swap.initiatorConfirmed && swap.recipientConfirmed) {
      this.commitSwapTransaction(room, swap);
    }

    this.broadcastRoomState(room);
  }

  private handleSwapCancel(ws: WebSocket) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    const swap = room.activeSwap;
    if (!swap) return;

    if (player.id !== swap.initiatorId && !player.isHost) {
      this.sendError(ws, 'Only initiator or host can cancel pending proposal.');
      return;
    }

    swap.status = 'cancelled';
    swap.turnLocked = false;
    room.activeSwap = null;

    this.logHistory(
      room,
      player.id,
      'swap_cancel',
      'negative',
      `${player.name} cancelled the Swap negotiation`
    );

    this.broadcastRoomState(room);
  }

  private commitSwapTransaction(room: RoomState, swap: SwapProposal) {
    this.saveSnapshot(room);

    const initiator = room.players[swap.initiatorId];
    const recipient = room.players[swap.recipientId];
    if (!initiator || !recipient) return;

    const activeTerms = swap.counterTerms || swap.terms;

    // Exchange unused pieces in tray
    const pInitIdx = initiator.pieces.findIndex((p) => p.id === activeTerms.offeredPieceId && !p.used);
    const pRecipIdx = recipient.pieces.findIndex((p) => p.id === activeTerms.requestedPieceId && !p.used);

    if (pInitIdx !== -1 && pRecipIdx !== -1) {
      const p1 = initiator.pieces[pInitIdx];
      const p2 = recipient.pieces[pRecipIdx];

      initiator.pieces.splice(pInitIdx, 1, p2);
      recipient.pieces.splice(pRecipIdx, 1, p1);
    }

    initiator.powerCards.swapUsed = true;
    swap.status = 'completed';
    swap.turnLocked = false;
    room.activeSwap = null;

    this.logHistory(
      room,
      initiator.id,
      'swap_complete',
      'positive',
      `Tile Exchange via Swap Card successfully completed between ${initiator.name} and ${recipient.name}!`
    );
  }

  // --- HOST CONTROLS ---
  private handleHostGrantExtraTurn(ws: WebSocket, toPlayerId: PlayerId, reason?: string) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!player.isHost) {
      this.sendError(ws, 'Only the host can grant extra turns.');
      return;
    }

    if (!room.settings.allowHostExtraTurns) {
      this.sendError(ws, 'Host-approved extra turns are disabled in lobby settings.');
      return;
    }

    const targetPlayer = room.players[toPlayerId];
    if (!targetPlayer) {
      this.sendError(ws, 'Target player not found.');
      return;
    }

    this.saveSnapshot(room);
    targetPlayer.extraTurns += 1;

    this.logHistory(
      room,
      player.id,
      'host_extra_turn',
      'positive',
      `Host granted an extra turn to ${targetPlayer.name} (${reason || 'Strategic allowance'})`
    );

    this.broadcastRoomState(room);
  }

  private handleHostPause(ws: WebSocket) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!player.isHost) {
      this.sendError(ws, 'Only host can pause game.');
      return;
    }

    room.status = 'paused';
    room.isTimerPaused = true;

    this.logHistory(room, player.id, 'host_pause', 'neutral', `Host paused gameplay`);
    this.broadcastRoomState(room);
  }

  private handleHostResume(ws: WebSocket) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!player.isHost) {
      this.sendError(ws, 'Only host can resume game.');
      return;
    }

    room.status = 'playing';
    room.isTimerPaused = false;

    this.logHistory(room, player.id, 'host_resume', 'neutral', `Host resumed gameplay`);
    this.broadcastRoomState(room);
  }

  private handleHostRollback(ws: WebSocket, targetSequence: number) {
    const ctx = this.getClientContext(ws);
    if (!ctx) return;
    const { room, player } = ctx;

    if (!player.isHost) {
      this.sendError(ws, 'Only host can execute a state rollback.');
      return;
    }

    // Find snapshot matching target sequence
    const snapshot = room.snapshots.find((s) => s.sequence === targetSequence);
    if (!snapshot) {
      this.sendError(ws, `Snapshot for action #${targetSequence} not available.`);
      return;
    }

    // Restore board
    room.board = snapshot.board.map((row) => row.map((c) => ({ ...c })));
    room.currentTurnPlayerId = snapshot.currentTurnPlayerId;
    room.turnTimeRemaining = snapshot.turnTimeRemaining;

    // Restore player scores, pieces, held tiles, powercards
    for (const pid of room.turnOrder) {
      const p = room.players[pid];
      if (p) {
        p.score = snapshot.scores[pid] || 0;
        p.pieces = snapshot.playerPieces[pid].map((piece) => ({ ...piece }));
        p.heldTiles = snapshot.playerHeldTiles[pid].map((h) => ({ ...h }));
        p.powerCards = { ...snapshot.powerCards[pid] };
      }
    }

    // Append reversal event in history (preserves audit trail)
    this.logHistory(
      room,
      player.id,
      'host_rollback',
      'negative',
      `Host reversed action #${targetSequence}. Restored board state and player inventories.`
    );

    this.broadcastRoomState(room);
  }

  // --- TIMER & TURNS ---
  private tickTimers() {
    for (const room of this.rooms.values()) {
      if (room.status === 'playing' && !room.isTimerPaused && room.settings.enableTurnTimer) {
        // If Swap negotiation is active and locked, do NOT expire turn!
        if (room.activeSwap && room.activeSwap.turnLocked) {
          continue;
        }

        if (room.turnTimeRemaining > 0) {
          room.turnTimeRemaining -= 1;
        } else {
          // Timer expired -> auto pass turn
          const activePid = room.currentTurnPlayerId;
          const player = room.players[activePid];
          this.logHistory(
            room,
            activePid,
            'turn_timeout',
            'negative',
            `Turn timer expired for ${player?.name || activePid}. Turn passed automatically.`
          );
          this.advanceTurn(room);
          this.broadcastRoomState(room);
        }
      }
    }
  }

  private advanceTurn(room: RoomState) {
    const currentIdx = room.turnOrder.indexOf(room.currentTurnPlayerId);
    let nextIdx = (currentIdx + 1) % room.turnOrder.length;

    // Skip disconnected or absent players if any
    for (let i = 0; i < room.turnOrder.length; i++) {
      const candId = room.turnOrder[nextIdx];
      const candPlayer = room.players[candId];
      if (candPlayer && candPlayer.isConnected) {
        room.currentTurnPlayerId = candId;
        break;
      }
      nextIdx = (nextIdx + 1) % room.turnOrder.length;
    }

    room.turnTimeRemaining = room.settings.turnDurationSeconds;
  }

  private checkConsensusOrEnd(room: RoomState) {
    const presentPlayers = room.turnOrder
      .map((pid) => room.players[pid])
      .filter(Boolean) as RoomPlayer[];

    if (presentPlayers.length >= 2 && presentPlayers.every((p) => p.score >= 50)) {
      room.winner = 'consensus';
      room.status = 'ended';
      this.logHistory(
        room,
        room.currentTurnPlayerId,
        'game_start',
        'positive',
        'Consensus reached! All 4 players achieved minimum 50 points!'
      );
    }
  }

  private saveSnapshot(room: RoomState) {
    const scores: Record<PlayerId, number> = { player1: 0, player2: 0, player3: 0, player4: 0 };
    const playerPieces: Record<PlayerId, any[]> = { player1: [], player2: [], player3: [], player4: [] };
    const playerHeldTiles: Record<PlayerId, any[]> = { player1: [], player2: [], player3: [], player4: [] };
    const powerCards: Record<PlayerId, { forceKeepUsed: boolean; swapUsed: boolean }> = {
      player1: { forceKeepUsed: false, swapUsed: false },
      player2: { forceKeepUsed: false, swapUsed: false },
      player3: { forceKeepUsed: false, swapUsed: false },
      player4: { forceKeepUsed: false, swapUsed: false },
    };

    for (const pid of room.turnOrder) {
      const p = room.players[pid];
      if (p) {
        scores[pid] = p.score;
        playerPieces[pid] = p.pieces.map((piece) => ({ ...piece }));
        playerHeldTiles[pid] = p.heldTiles.map((h) => ({ ...h }));
        powerCards[pid] = { ...p.powerCards };
      }
    }

    const snapshot: GameSnapshot = {
      sequence: room.history.length + 1,
      board: room.board.map((row) => row.map((cell) => ({ ...cell }))),
      scores,
      playerPieces,
      playerHeldTiles,
      powerCards,
      currentTurnPlayerId: room.currentTurnPlayerId,
      turnTimeRemaining: room.turnTimeRemaining,
    };

    room.snapshots.push(snapshot);
    // Keep last 30 snapshots to bound memory
    if (room.snapshots.length > 30) {
      room.snapshots.shift();
    }
  }

  private logHistory(
    room: RoomState,
    playerId: PlayerId,
    eventType: HistoryEvent['eventType'],
    category: HistoryEvent['category'],
    description: string,
    details?: Record<string, unknown>
  ) {
    const p = room.players[playerId];
    const event: HistoryEvent = {
      sequence: room.history.length + 1,
      timestamp: Date.now(),
      playerId,
      playerName: p?.name || playerId,
      playerCode: p?.code || playerId,
      eventType,
      category,
      description,
      details,
      snapshotIndex: room.snapshots.length,
    };

    room.history.push(event);
  }

  private getClientContext(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return null;
    const room = this.rooms.get(client.roomCode);
    if (!room) return null;

    let player: RoomPlayer | null = null;
    for (const pid of room.turnOrder) {
      const p = room.players[pid];
      if (p && p.sessionId === client.sessionId) {
        player = p;
        break;
      }
    }

    if (!player) return null;
    return { client, room, player };
  }

  private broadcastRoomState(room: RoomState) {
    for (const [ws, client] of this.clients.entries()) {
      if (client.roomCode === room.roomCode && ws.readyState === WebSocket.OPEN) {
        let yourPlayerId: PlayerId | null = null;
        let isHost = false;

        for (const pid of room.turnOrder) {
          const p = room.players[pid];
          if (p && p.sessionId === client.sessionId) {
            yourPlayerId = pid;
            isHost = p.isHost;
            break;
          }
        }

        const msg: ServerMessage = {
          type: 'room_state',
          state: room,
          yourPlayerId,
          isHost,
        };

        ws.send(JSON.stringify(msg));
      }
    }
  }

  private send(ws: WebSocket, msg: ServerMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  private sendError(ws: WebSocket, message: string) {
    this.send(ws, { type: 'error', message });
  }

  // REST API helper to get room info
  public getRoomInfo(roomCode: string) {
    return this.rooms.get(roomCode.toUpperCase()) || null;
  }
}
