/**
 * iBlokYou: Conflict to Consensus (Version 2.0)
 * Upgraded 4-Player Authoritative Real-Time Online Multiplayer
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PlayerId, PolyominoShape } from './types/game';
import { PLAYERS } from './data/storylineScript';
import { RAW_PIECES_DATA, transformMatrix } from './utils/pieces';
import { sound } from './utils/audio';
import { useMultiplayer } from './utils/useMultiplayer';

import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { PlayerCard } from './components/PlayerCard';
import { LobbyView } from './components/LobbyView';
import { OpeningPage } from './components/OpeningPage';
import { SwapModal } from './components/SwapModal';
import { HistoryModal } from './components/HistoryModal';
import { HostControlsModal } from './components/HostControlsModal';
import { HomepageGuide } from './components/HomepageGuide';
import { DocumentationModal } from './components/DocumentationModal';

import {
  Trophy,
  Copy,
  Check,
  BookOpen,
  Gamepad2,
  Info,
  Clock,
  Shield,
  ArrowRightLeft,
  Zap,
  Play,
  Pause,
  AlertCircle,
  Wifi,
  WifiOff,
  Users,
  ChevronRight,
  LogOut,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const VERSION_TAG = 'v2.0';

  // Origin for shareable links
  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-ohmatrdomvnhgfvh53idcw-970942998158.asia-east1.run.app';

  // Multiplayer Hook
  const {
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
  } = useMultiplayer();

  // Navigation tab view when not in a room: 'home' | 'game'
  const [activeTab, setActiveTab] = useState<'game' | 'home'>('game');

  // Interactive Piece Placement State
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>('L5');
  const [rotation, setRotation] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [forceKeepActive, setForceKeepActive] = useState<boolean>(false);
  const [selectedHeldTileId, setSelectedHeldTileId] = useState<string | null>(null);

  // Modals State
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState<boolean>(false);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Confetti trigger ref
  const confettiFiredRef = useRef(false);

  // Detect room code from URL query (?room=ABCD or ?join=ABCD) on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join');
    if (roomParam && !roomState) {
      const storedName = localStorage.getItem('iblokyou_player_name') || 'Player';
      joinRoom(roomParam.toUpperCase(), storedName);
    }
  }, [joinRoom, roomState]);

  // Check consensus celebration
  useEffect(() => {
    if (!roomState) return;

    const activePlayers = roomState.turnOrder
      .map((pid) => roomState.players[pid])
      .filter(Boolean);

    const allReached50 =
      activePlayers.length >= 2 &&
      activePlayers.every((p) => p && p.score >= 50);

    if ((allReached50 || roomState.winner === 'consensus') && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      sound.playVictoryFanfare();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  }, [roomState]);

  // Keyboard shortcuts for rotate (R) and flip (F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        setRotation((prev) => (prev + 90) % 360);
        sound.playTileRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        setFlipped((prev) => !prev);
        sound.playTileRotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute selected shape matrix
  const currentUnusedPieces =
    yourPlayerId && roomState && roomState.players[yourPlayerId]
      ? roomState.players[yourPlayerId]?.pieces || []
      : [];

  const rawPiece = RAW_PIECES_DATA.find((p) => p.id === selectedPieceId);
  const transformedShape: PolyominoShape | null = rawPiece
    ? transformMatrix(rawPiece.matrix, rotation, flipped)
    : null;

  // Active player information
  const currentTurnPlayer = roomState ? roomState.players[roomState.currentTurnPlayerId] : null;
  const isYourTurn = roomState && yourPlayerId ? roomState.currentTurnPlayerId === yourPlayerId : false;

  // Handle cell click on GameBoard
  const handleBoardCellClick = (row: number, col: number) => {
    if (!roomState || roomState.status !== 'playing') return;

    if (!isYourTurn) {
      setErrorMessage("It's not your turn to place a tile.");
      sound.playAlertBuzzer();
      return;
    }

    // 1. Force Keep Tile Capture
    if (forceKeepActive) {
      const targetCell = roomState.board[row][col];
      if (!targetCell.playerId || targetCell.playerId === yourPlayerId) {
        setErrorMessage('Select an opponent tile to capture with Force Keep.');
        sound.playAlertBuzzer();
        return;
      }
      forceKeep(row, col);
      setForceKeepActive(false);
      sound.playPowerCardShimmer();
      return;
    }

    // 2. Placing Captured Held Tile
    if (selectedHeldTileId) {
      placeHeldTile(selectedHeldTileId, row, col);
      setSelectedHeldTileId(null);
      sound.playTilePlace();
      return;
    }

    // 3. Regular Polyomino Tile Placement
    if (!selectedPieceId || !transformedShape) {
      setErrorMessage('Please select a piece from your tray first.');
      return;
    }

    placeTile(
      selectedPieceId,
      transformedShape,
      row,
      col,
      rotation,
      flipped
    );
    sound.playTilePlace();
  };

  // Copy shareable room link
  const handleCopyShareableLink = () => {
    if (!roomState) return;
    const shareUrl = `${currentOrigin.split('?')[0]}?room=${roomState.roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    sound.playTilePlace();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Create room helper
  const handleCreateRoom = (playerName: string) => {
    localStorage.setItem('iblokyou_player_name', playerName);
    createRoom(playerName);
  };

  // Join room helper
  const handleJoinRoom = (roomCode: string, playerName: string) => {
    localStorage.setItem('iblokyou_player_name', playerName);
    joinRoom(roomCode, playerName);
  };

  // Derive scores map for GameBoard
  const scoresMap: Record<PlayerId, number> = {
    player1: roomState?.players.player1?.score || 0,
    player2: roomState?.players.player2?.score || 0,
    player3: roomState?.players.player3?.score || 0,
    player4: roomState?.players.player4?.score || 0,
  };

  // Held tiles for your player
  const yourPlayer = yourPlayerId && roomState ? roomState.players[yourPlayerId] : null;
  const heldTiles = yourPlayer?.heldTiles || [];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* GLOBAL TOAST & ERROR NOTIFICATIONS */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-2 hover:bg-rose-700 p-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPLICATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Version */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                iBlokYou
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                4-Player Online
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {VERSION_TAG}
              </span>
            </div>

            {/* Connection Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Server Online' : 'Connecting...'}</span>
            </div>
          </div>

          {/* Room status & Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {roomState ? (
              <>
                {/* Room Code Badge */}
                <button
                  onClick={handleCopyShareableLink}
                  title="Click to copy room shareable link"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : `Room: ${roomState.roomCode}`}</span>
                </button>

                {/* Your Seat Badge */}
                {yourPlayer && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
                    style={{
                      borderColor: yourPlayer.colorHex,
                      backgroundColor: `${yourPlayer.colorHex}15`,
                      color: yourPlayer.colorHex,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: yourPlayer.colorHex }}
                    />
                    <span>You: {yourPlayer.name} ({yourPlayer.role})</span>
                    {isHost && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-white font-mono">
                        HOST
                      </span>
                    )}
                  </div>
                )}

                {/* Host Controls Button */}
                {isHost && roomState.status === 'playing' && (
                  <button
                    onClick={() => setIsHostControlsOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Host Controls</span>
                  </button>
                )}

                {/* History Drawer Trigger */}
                {roomState.status !== 'lobby' && (
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>History ({roomState.history.length})</span>
                  </button>
                )}

                {/* Leave Room Button */}
                <button
                  onClick={leaveRoom}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave</span>
                </button>
              </>
            ) : (
              /* View switcher when outside a room */
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('game')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'game'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>4-Player Match</span>
                </button>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Examiner Guide & Rules</span>
                </button>

                <a
                  href="/iblokyou.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title="Open standalone single-file Conflict Management Edition in new tab"
                >
                  <span>📄 Pure .html</span>
                </a>
              </div>
            )}

            {/* Docs Hub Button */}
            <button
              onClick={() => setIsDocsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Info className="w-4 h-4" />
              <span>Docs Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT ROUTING */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* CASE 1: NOT IN A ROOM */}
        {!roomState && (
          activeTab === 'home' ? (
            <HomepageGuide
              onStartGame={() => setActiveTab('game')}
              onOpenDocs={() => setIsDocsOpen(true)}
              publicAppUrl={currentOrigin}
              version={VERSION_TAG}
            />
          ) : (
            <OpeningPage
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              publicAppUrl={currentOrigin}
              version={VERSION_TAG}
            />
          )
        )}

        {/* CASE 2: IN A ROOM, LOBBY STAGE */}
        {roomState && roomState.status === 'lobby' && (
          <LobbyView
            roomState={roomState}
            yourPlayerId={yourPlayerId}
            isHost={isHost}
            onSetReady={setReady}
            onUpdateSettings={updateSettings}
            onStartGame={startGame}
            onLeaveRoom={leaveRoom}
            publicAppUrl={currentOrigin}
          />
        )}

        {/* CASE 3: IN A ROOM, ACTIVE PLAYING OR PAUSED STAGE */}
        {roomState && (roomState.status === 'playing' || roomState.status === 'paused' || roomState.status === 'ended') && (
          <>
            {/* Top Turn & Match State Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              {/* Turn Indicator */}
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full animate-pulse shadow-xs"
                  style={{ backgroundColor: currentTurnPlayer?.colorHex || '#2563eb' }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500">
                      Current Turn:
                    </span>
                    <strong className="text-sm font-bold text-slate-900">
                      {currentTurnPlayer ? `${currentTurnPlayer.name} (${currentTurnPlayer.role})` : 'Waiting'}
                    </strong>
                    {isYourTurn && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        It's Your Turn!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {roomState.status === 'paused'
                      ? 'Game is currently paused by host.'
                      : roomState.activeSwap
                      ? 'Turn is locked while Swap negotiation is underway.'
                      : isYourTurn
                      ? 'Select an unused piece below, rotate (R) / flip (F), hover over board until GREEN, then click.'
                      : `Awaiting tile placement from ${currentTurnPlayer?.name || 'opponent'}.`}
                  </p>
                </div>
              </div>

              {/* Authoritative Turn Timer */}
              <div className="flex items-center gap-3">
                {roomState.settings.enableTurnTimer && (
                  <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                      roomState.isTimerPaused
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : roomState.turnTimeRemaining <= 15
                        ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>
                      {roomState.isTimerPaused ? 'PAUSED' : `${roomState.turnTimeRemaining}s`}
                    </span>
                  </div>
                )}

                {/* Pass Turn Button */}
                {isYourTurn && (
                  <button
                    onClick={passTurn}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer active:scale-95"
                    title="Pass turn if you have no valid legal moves"
                  >
                    Pass Turn
                  </button>
                )}
              </div>
            </div>

            {/* CONSENSUS / VICTORY BANNER */}
            {(roomState.winner || Object.values(scoresMap).every((s) => s >= 50)) && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white shadow-lg space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-lg font-black">
                  <Trophy className="w-6 h-6 text-amber-300 fill-amber-300" />
                  <span>CONSENSUS ACHIEVED! ALL PLAYERS ACHIEVED &ge; 50 POINTS!</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Through assertive strategic maneuvers, face-saving concessions, and cooperative Power Card deployment, every café patron reached the 50-point milestone. Mutual benefit fulfilled with zero players eliminated!
                </p>
              </div>
            )}

            {/* TWO-COLUMN LAYOUT: BOARD & PLAYER/CONTROLS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: 20x20 Tactical Matrix & Piece Tray */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <GameBoard
                  board={roomState.board}
                  onCellClick={handleBoardCellClick}
                  selectedShape={transformedShape}
                  activePlayerId={roomState.currentTurnPlayerId}
                  playMode="manual"
                  scores={scoresMap}
                  showLegalGuide={true}
                />

                {/* Quick Board Interaction Controls Bar */}
                {isYourTurn && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRotation((prev) => (prev + 90) % 360);
                          sound.playTileRotate();
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#34495e] hover:bg-[#2c3e50] text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Rotate ↻ (R)
                      </button>
                      <button
                        onClick={() => {
                          setFlipped((prev) => !prev);
                          sound.playTileRotate();
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#34495e] hover:bg-[#2c3e50] text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Flip ↔ (F)
                      </button>
                      <button
                        onClick={passTurn}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer"
                      >
                        Pass Turn
                      </button>
                    </div>

                    <button
                      onClick={() => setIsSwapDialogOpen(true)}
                      disabled={yourPlayer?.powerCards.swapUsed || !roomState.settings.enableSwap}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        yourPlayer?.powerCards.swapUsed || !roomState.settings.enableSwap
                          ? 'opacity-40 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-[#9b59b6] hover:bg-[#8e44ad] text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{yourPlayer?.powerCards.swapUsed ? 'Swap Card (Used)' : 'Activate Swap Card'}</span>
                    </button>
                  </div>
                )}

                {/* Power Cards Toolbar for Active Player */}
                {isYourTurn && (
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Power Cards:</span>
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Card 1: Change Swap */}
                      <button
                        onClick={() => setIsSwapDialogOpen(true)}
                        disabled={yourPlayer?.powerCards.swapUsed || !roomState.settings.enableSwap}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          yourPlayer?.powerCards.swapUsed || !roomState.settings.enableSwap
                            ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                        }`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>
                          {yourPlayer?.powerCards.swapUsed ? 'Swap (Used)' : '1: Change Swap'}
                        </span>
                      </button>

                      {/* Card 2: Force Keep */}
                      <button
                        onClick={() => setForceKeepActive(!forceKeepActive)}
                        disabled={yourPlayer?.powerCards.forceKeepUsed || !roomState.settings.enableForceKeep}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          yourPlayer?.powerCards.forceKeepUsed || !roomState.settings.enableForceKeep
                            ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : forceKeepActive
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-300'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300 shadow-xs'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>
                          {yourPlayer?.powerCards.forceKeepUsed
                            ? 'Force Keep (Used)'
                            : forceKeepActive
                            ? 'Click Opponent Tile...'
                            : '2: Force Keep'}
                        </span>
                      </button>

                      {/* Card 3: Defensive Cross */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold">
                        <span>3: Defensive X-5</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Held Tiles Inventory (from Force Keep) */}
                {heldTiles.length > 0 && isYourTurn && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span>Captured Held Tiles ({heldTiles.length})</span>
                      <span className="text-[10px] text-purple-600 font-normal">
                        Select a held monomino to deploy onto legal corner
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {heldTiles.map((ht) => (
                        <button
                          key={ht.id}
                          onClick={() => setSelectedHeldTileId(ht.id)}
                          className={`p-2 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${
                            selectedHeldTileId === ht.id
                              ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300'
                              : 'bg-white text-purple-900 border-purple-300 hover:bg-purple-100'
                          }`}
                        >
                          Held [{ht.size} sq]
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Piece Tray for Active Player */}
                {yourPlayer && (
                  <PieceTray
                    pieces={yourPlayer.pieces}
                    selectedPieceId={selectedPieceId}
                    onSelectPiece={(id) => {
                      setSelectedPieceId(id);
                      setSelectedHeldTileId(null);
                    }}
                    rotation={rotation}
                    flipped={flipped}
                    onRotate={() => {
                      setRotation((prev) => (prev + 90) % 360);
                      sound.playTileRotate();
                    }}
                    onFlip={() => {
                      setFlipped((prev) => !prev);
                      sound.playTileRotate();
                    }}
                    playerColorHex={yourPlayer.colorHex}
                    playerName={yourPlayer.name}
                  />
                )}
              </div>

              {/* RIGHT COLUMN: 4 Player Cards + Live Feed + Host Shortcuts */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* 2x2 Grid of Player Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  {roomState.turnOrder.map((pid) => {
                    const p = roomState.players[pid];
                    const cfg = PLAYERS[pid];
                    const score = p?.score || 0;
                    const isActive = roomState.currentTurnPlayerId === pid;

                    return (
                      <PlayerCard
                        key={pid}
                        player={{
                          ...cfg,
                          name: p ? p.name : cfg.name,
                          politenessTokens: 3,
                        }}
                        score={score}
                        isActive={isActive}
                        hasConsensus={score >= 50}
                      />
                    );
                  })}
                </div>

                {/* Host Quick Toolbar */}
                {isHost && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Host Match Management</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">AUTHORITATIVE</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {roomState.status === 'paused' ? (
                        <button
                          onClick={hostResume}
                          className="py-2 px-2.5 rounded-xl font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={hostPause}
                          className="py-2 px-2.5 rounded-xl font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause</span>
                        </button>
                      )}

                      <button
                        onClick={() => setIsHostControlsOpen(true)}
                        className="py-2 px-2.5 rounded-xl font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extra Turn</span>
                      </button>

                      <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="py-2 px-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Rollback</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Authoritative Live Action Feed (Latest 4 events) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Live Match Action Feed</span>
                    </div>
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      View All ({roomState.history.length})
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {roomState.history.length === 0 ? (
                      <p className="text-slate-400 text-center py-4 text-xs">
                        Game started. No tile placements yet.
                      </p>
                    ) : (
                      [...roomState.history]
                        .reverse()
                        .slice(0, 4)
                        .map((evt) => (
                          <div
                            key={evt.sequence}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      PLAYERS[evt.playerId]?.colorHex || '#64748b',
                                  }}
                                />
                                <span>{evt.playerName}</span>
                                <span className="text-[10px] font-mono text-slate-400 font-normal">
                                  #{evt.sequence}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                                {evt.description}
                              </p>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                evt.category === 'positive'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : evt.category === 'negative'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {evt.category}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* POPUP MODALS */}
      {/* 1. History Modal with Host Rollback */}
      {roomState && (
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={roomState.history}
          isHost={isHost}
          onRollback={(seq) => {
            hostRollback(seq);
            setIsHistoryOpen(false);
          }}
        />
      )}

      {/* 2. Host Command Controls Modal */}
      {roomState && isHost && (
        <HostControlsModal
          isOpen={isHostControlsOpen}
          onClose={() => setIsHostControlsOpen(false)}
          roomState={roomState}
          onPause={hostPause}
          onResume={hostResume}
          onGrantExtraTurn={hostGrantExtraTurn}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* 3. Simplified Direct Binary Swap Modal:
          [Tile Selected] -> [Select Target Player] -> [Play Swap Card] -> [A / B Prompt] -> [Show Legal Placements] */}
      {roomState && (
        <SwapModal
          isOpen={isSwapDialogOpen || Boolean(roomState.activeSwap)}
          onClose={() => {
            setIsSwapDialogOpen(false);
            if (roomState.activeSwap && roomState.activeSwap.initiatorId === yourPlayerId) {
              cancelSwap();
            }
          }}
          roomState={roomState}
          yourPlayerId={yourPlayerId}
          selectedTileId={selectedPieceId}
          activeSwap={roomState.activeSwap}
          onConfirmExchange={(targetPlayerId, offeredPieceId, requestedPieceId) => {
            proposeSwap(targetPlayerId, offeredPieceId, requestedPieceId);
            setIsSwapDialogOpen(false);
          }}
          onResolveActiveSwap={(isAccepted) => {
            if (isAccepted) {
              respondSwap('accept');
              // Automatically switch to the swapped tile so legal placements show immediately!
              if (roomState.activeSwap) {
                const acquiredPieceId =
                  yourPlayerId === roomState.activeSwap.recipientId
                    ? roomState.activeSwap.terms.offeredPieceId
                    : roomState.activeSwap.terms.requestedPieceId;
                setSelectedPieceId(acquiredPieceId);
                sound.playPowerCardShimmer();
              }
            } else {
              respondSwap('decline');
            }
          }}
        />
      )}

      {/* 4. Complete Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        publicAppUrl={currentOrigin}
        version={VERSION_TAG}
      />
    </div>
  );
}
