/**
 * WebSocket Multiplayer Client Hook for iBlokYou.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ClientMessage,
  ServerMessage,
  RoomState,
  PlayerId,
  HostSettings,
  SwapTerms,
} from '../types/multiplayer';
import { PolyominoShape } from '../types/game';

function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'iblokyou_player_session_id';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useMultiplayer() {
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRoomCodeRef = useRef<string | null>(null);
  const activePlayerNameRef = useRef<string>('Player');

  // Clear toast after 3.5s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Connect WebSocket
  const connectWs = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setErrorMessage(null);

        // If previously in a room, attempt auto-reconnect
        if (activeRoomCodeRef.current) {
          const joinMsg: ClientMessage = {
            type: 'join_room',
            roomCode: activeRoomCodeRef.current,
            playerName: activePlayerNameRef.current,
            sessionId,
          };
          ws.send(JSON.stringify(joinMsg));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          if (msg.type === 'room_state') {
            setRoomState(msg.state);
            setYourPlayerId(msg.yourPlayerId);
            setIsHost(msg.isHost);
            activeRoomCodeRef.current = msg.state.roomCode;
          } else if (msg.type === 'error') {
            setErrorMessage(msg.message);
          } else if (msg.type === 'toast') {
            setToastMessage(msg.message);
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect in 2s
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWs();
        }, 2000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }
  }, [sessionId]);

  useEffect(() => {
    connectWs();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      setErrorMessage('Disconnected from server. Reconnecting...');
    }
  }, []);

  // Actions
  const createRoom = useCallback(
    (playerName: string, customSettings?: Partial<HostSettings>) => {
      activePlayerNameRef.current = playerName;
      send({
        type: 'create_room',
        playerName,
        sessionId,
        settings: customSettings,
      });
    },
    [send, sessionId]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      activeRoomCodeRef.current = roomCode;
      activePlayerNameRef.current = playerName;
      send({
        type: 'join_room',
        roomCode,
        playerName,
        sessionId,
      });
    },
    [send, sessionId]
  );

  const setReady = useCallback(
    (ready: boolean) => {
      send({ type: 'set_ready', ready });
    },
    [send]
  );

  const updateSettings = useCallback(
    (settings: Partial<HostSettings>) => {
      send({ type: 'update_settings', settings });
    },
    [send]
  );

  const startGame = useCallback(() => {
    send({ type: 'start_game' });
  }, [send]);

  const placeTile = useCallback(
    (pieceId: string, shape: PolyominoShape, row: number, col: number, rotation: number, flipped: boolean) => {
      send({
        type: 'place_tile',
        pieceId,
        shape,
        row,
        col,
        rotation,
        flipped,
      });
    },
    [send]
  );

  const passTurn = useCallback(() => {
    send({ type: 'pass_turn' });
  }, [send]);

  const forceKeep = useCallback(
    (targetRow: number, targetCol: number) => {
      send({ type: 'force_keep', targetRow, targetCol });
    },
    [send]
  );

  const placeHeldTile = useCallback(
    (heldTileId: string, row: number, col: number) => {
      send({ type: 'place_held_tile', heldTileId, row, col });
    },
    [send]
  );

  const proposeSwap = useCallback(
    (recipientId: PlayerId, offeredPieceId: string, requestedPieceId: string, offeredTileCoord?: [number, number], requestedTileCoord?: [number, number]) => {
      send({
        type: 'swap_propose',
        recipientId,
        offeredPieceId,
        requestedPieceId,
        offeredTileCoord,
        requestedTileCoord,
      });
    },
    [send]
  );

  const respondSwap = useCallback(
    (action: 'accept' | 'decline' | 'counter', counterTerms?: SwapTerms) => {
      send({ type: 'swap_respond', action, counterTerms });
    },
    [send]
  );

  const confirmSwap = useCallback(
    (confirmed: boolean) => {
      send({ type: 'swap_confirm', confirmed });
    },
    [send]
  );

  const cancelSwap = useCallback(() => {
    send({ type: 'swap_cancel' });
  }, [send]);

  const hostGrantExtraTurn = useCallback(
    (toPlayerId: PlayerId, reason?: string) => {
      send({ type: 'host_grant_extra_turn', toPlayerId, reason });
    },
    [send]
  );

  const hostPause = useCallback(() => {
    send({ type: 'host_pause' });
  }, [send]);

  const hostResume = useCallback(() => {
    send({ type: 'host_resume' });
  }, [send]);

  const hostRollback = useCallback(
    (eventSequence: number) => {
      send({ type: 'host_rollback', eventSequence });
    },
    [send]
  );

  const leaveRoom = useCallback(() => {
    activeRoomCodeRef.current = null;
    setRoomState(null);
    setYourPlayerId(null);
    setIsHost(false);
  }, []);

  return {
    sessionId,
    roomState,
    yourPlayerId,
    isHost,
    isConnected,
    errorMessage,
    setErrorMessage,
    toastMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    updateSettings,
    startGame,
    placeTile,
    passTurn,
    forceKeep,
    placeHeldTile,
    proposeSwap,
    respondSwap,
    confirmSwap,
    cancelSwap,
    hostGrantExtraTurn,
    hostPause,
    hostResume,
    hostRollback,
  };
}
