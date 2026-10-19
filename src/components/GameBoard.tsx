import React, { useState, useMemo } from 'react';
import { BoardCell, PlayerId, PolyominoShape } from '../types/game';
import { PLAYERS } from '../data/storylineScript';
import {
  BOARD_SIZE,
  isValidBlokusPlacement,
  getShapeCells,
  calculateLegalPlacements,
} from '../utils/blokusLogic';
import { Box, Layers, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface GameBoardProps {
  board: BoardCell[][];
  onCellClick?: (row: number, col: number) => void;
  selectedShape?: PolyominoShape | null;
  activePlayerId: PlayerId;
  playMode: 'auto' | 'manual';
  scores: Record<PlayerId, number>;
  showLegalGuide?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onCellClick,
  selectedShape,
  activePlayerId,
  playMode,
  scores,
  showLegalGuide = true,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d');
  const [hoverCoord, setHoverCoord] = useState<[number, number] | null>(null);

  // Compute hovered cells and validity in real-time
  const isFirstMove = scores[activePlayerId] === 0;

  // Step 3: Programmatically calculate all legal placement coordinates for selected tile
  const legalPlacements = useMemo(() => {
    if (!selectedShape || playMode !== 'manual') return [];
    return calculateLegalPlacements(board, selectedShape, activePlayerId, isFirstMove);
  }, [board, selectedShape, activePlayerId, isFirstMove, playMode]);

  const legalOriginsSet = useMemo(() => {
    return new Set(legalPlacements.map(([r, c]) => `${r}-${c}`));
  }, [legalPlacements]);

  let hoverCells: [number, number][] = [];
  let isPlacementValid = false;
  let invalidReason = '';

  if (playMode === 'manual' && selectedShape && hoverCoord) {
    const [hr, hc] = hoverCoord;
    hoverCells = getShapeCells(selectedShape, hr, hc);

    const validation = isValidBlokusPlacement(
      board,
      selectedShape,
      hr,
      hc,
      activePlayerId,
      isFirstMove
    );
    isPlacementValid = validation.valid;
    invalidReason = validation.reason || '';
  }

  const isStartCorner = (r: number, c: number): PlayerId | null => {
    if (r === 0 && c === 0) return 'player1';
    if (r === 0 && c === 19) return 'player2';
    if (r === 19 && c === 0) return 'player3';
    if (r === 19 && c === 19) return 'player4';
    return null;
  };

  // Find all legal diagonal corners for current player to show helpful green helper anchors
  const legalAnchorCorners: [number, number][] = [];
  if (playMode === 'manual') {
    if (isFirstMove) {
      if (activePlayerId === 'player1') legalAnchorCorners.push([0, 0]);
      if (activePlayerId === 'player2') legalAnchorCorners.push([0, 19]);
      if (activePlayerId === 'player3') legalAnchorCorners.push([19, 0]);
      if (activePlayerId === 'player4') legalAnchorCorners.push([19, 19]);
    } else {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c].playerId === null) {
            // Check if touches corner of own color and no edge of own color
            const hasCorner = [
              [r - 1, c - 1],
              [r - 1, c + 1],
              [r + 1, c - 1],
              [r + 1, c + 1],
            ].some(
              ([dr, dc]) =>
                dr >= 0 &&
                dr < BOARD_SIZE &&
                dc >= 0 &&
                dc < BOARD_SIZE &&
                board[dr][dc].playerId === activePlayerId
            );

            const hasEdge = [
              [r - 1, c],
              [r + 1, c],
              [r, c - 1],
              [r, c + 1],
            ].some(
              ([er, ec]) =>
                er >= 0 &&
                er < BOARD_SIZE &&
                ec >= 0 &&
                ec < BOARD_SIZE &&
                board[er][ec].playerId === activePlayerId
            );

            if (hasCorner && !hasEdge) {
              legalAnchorCorners.push([r, c]);
            }
          }
        }
      }
    }
  }

  return (
    <div className="relative p-3 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm select-none">
      {/* Board Header Controls */}
      <div className="flex flex-wrap justify-between items-center mb-3 px-1 gap-2 text-xs font-mono">
        <span className="flex items-center gap-2 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span>iBlokYou 20×20 TACTICAL MATRIX</span>
        </span>

        {/* 3D vs 2D View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Tabletop</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === '2d'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Flat Grid</span>
          </button>
        </div>
      </div>

      {/* Manual Mode Hover & Legal Placements Status Bar */}
      {playMode === 'manual' && (
        <div
          className={`mb-3 py-2 px-3.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-medium transition-all ${
            hoverCoord && isPlacementValid
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
              : hoverCoord && !isPlacementValid
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : legalPlacements.length > 0
              ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {hoverCoord && isPlacementValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : hoverCoord && !isPlacementValid ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : legalPlacements.length > 0 ? (
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            )}
            <span>
              {hoverCoord && isPlacementValid
                ? 'Valid position! Click to drop tile.'
                : hoverCoord && !isPlacementValid
                ? `Cannot place here: ${invalidReason}`
                : legalPlacements.length > 0
                ? `${legalPlacements.length} legal placement spots highlighted in green. Click any green anchor to place!`
                : 'Select an unused tile or rotate/flip to find legal positions.'}
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
            {PLAYERS[activePlayerId].name}
          </span>
        </div>
      )}

      {/* Tabletop Perspective View */}
      <div
        className={`w-full overflow-hidden transition-all duration-300 flex items-center justify-center ${
          viewMode === '3d'
            ? 'py-6 sm:py-8 bg-[#111317] rounded-2xl shadow-2xl'
            : 'py-2 bg-slate-100 rounded-xl'
        }`}
        style={viewMode === '3d' ? { perspective: '1200px' } : undefined}
      >
        <div
          className={`relative aspect-square w-full max-w-[500px] sm:max-w-[540px] transition-transform duration-300 ${
            viewMode === '3d'
              ? 'p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c1f26] via-[#16181e] to-[#0f1013] border-4 border-[#2d313c] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]'
              : 'border border-slate-300 rounded-xl bg-white shadow-xs'
          }`}
          style={
            viewMode === '3d'
              ? { transform: 'rotateX(36deg) scale(0.96)', transformStyle: 'preserve-3d' }
              : undefined
          }
          onMouseLeave={() => setHoverCoord(null)}
        >
          {/* Grid Surface */}
          <div
            className={`w-full h-full rounded-lg overflow-hidden border ${
              viewMode === '3d'
                ? 'bg-[#1e2129] border-[#2f3442] shadow-[inset_0_4px_12px_rgba(0,0,0,0.7)]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`grid grid-cols-20 grid-rows-20 w-full h-full gap-[1px] ${
                viewMode === '3d' ? 'bg-[#121418]' : 'bg-slate-200'
              }`}
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const startCornerPlayer = isStartCorner(r, c);
                  const cellPlayer = cell.playerId ? PLAYERS[cell.playerId] : null;

                  const isHovered = hoverCells.some(([hr, hc]) => hr === r && hc === c);
                  const isLegalOrigin =
                    playMode === 'manual' &&
                    showLegalGuide &&
                    legalOriginsSet.has(`${r}-${c}`);
                  const isAnchor =
                    playMode === 'manual' &&
                    legalAnchorCorners.some(([ar, ac]) => ar === r && ac === c);

                  let cellBg = viewMode === '3d' ? 'bg-[#22262f]/90' : 'bg-white';
                  let cellBorder = '';

                  if (cellPlayer) {
                    cellBg = '';
                  } else if (isHovered) {
                    // Non-epileptic clean solid green/red preview
                    cellBg = isPlacementValid
                      ? 'bg-emerald-500/70 border-2 border-[#2ecc71]'
                      : 'bg-rose-500/60 border-2 border-[#e74c3c]';
                  } else if (isLegalOrigin) {
                    // Step 3: Static non-epileptic legal-move-highlight
                    cellBg = 'bg-[#2ecc71]/25 border-2 border-[#2ecc71]';
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      data-row={r}
                      data-col={c}
                      onMouseEnter={() => setHoverCoord([r, c])}
                      onClick={() => onCellClick && onCellClick(r, c)}
                      className={`relative flex items-center justify-center transition-colors duration-75 cursor-pointer ${cellBg} ${cellBorder}`}
                      style={{
                        backgroundColor: cellPlayer ? cellPlayer.colorHex : undefined,
                      }}
                      title={`[R${r + 1}, C${c + 1}]`}
                    >
                      {/* Acrylic bevel reflection */}
                      {cellPlayer && (
                        <div
                          className={`absolute inset-[1px] rounded-[1px] pointer-events-none ${
                            viewMode === '3d'
                              ? 'border-t-2 border-l-2 border-white/50 border-b-2 border-r-2 border-black/40 shadow-xs'
                              : 'border-t border-l border-white/40 border-b border-black/20'
                          }`}
                        />
                      )}

                      {/* Static non-epileptic legal placement anchor dot */}
                      {!cellPlayer && isLegalOrigin && !isHovered && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] shadow-xs pointer-events-none" />
                      )}

                      {/* Fallback corner anchor dot if not already highlighted as legal origin */}
                      {!cellPlayer && !isLegalOrigin && isAnchor && !isHovered && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-80 pointer-events-none" />
                      )}

                      {/* Starting Corner Markers */}
                      {!cellPlayer && startCornerPlayer && !isHovered && !isLegalOrigin && (
                        <div
                          className="w-2.5 h-2.5 rounded-full opacity-70 pointer-events-none"
                          style={{ backgroundColor: PLAYERS[startCornerPlayer].colorHex }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" />
          <span className="truncate font-semibold">P1 (Blue · Top-Left)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-xs" />
          <span className="truncate font-semibold">P2 (Yellow · Top-Right)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 shadow-xs" />
          <span className="truncate font-semibold">P3 (Red · Btm-Left)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600 shadow-xs" />
          <span className="truncate font-semibold">P4 (Green · Btm-Right)</span>
        </div>
      </div>
    </div>
  );
};
