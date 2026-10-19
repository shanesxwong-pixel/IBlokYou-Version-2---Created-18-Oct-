import React from 'react';
import { Piece } from '../types/game';
import { RotateCw, FlipHorizontal } from 'lucide-react';
import { transformMatrix } from '../utils/pieces';

interface PieceTrayProps {
  pieces: Piece[];
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
  rotation: number;
  flipped: boolean;
  onRotate: () => void;
  onFlip: () => void;
  playerColorHex: string;
  playerName: string;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  selectedPieceId,
  onSelectPiece,
  rotation,
  flipped,
  onRotate,
  onFlip,
  playerColorHex,
  playerName,
}) => {
  const selectedPiece = pieces.find((p) => p.id === selectedPieceId);
  const transformedMatrix = selectedPiece
    ? transformMatrix(selectedPiece.matrix, rotation, flipped)
    : null;

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
      {/* Tray Header & Controls */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shadow-xs"
            style={{ backgroundColor: playerColorHex }}
          />
          <h4 className="text-xs font-bold text-slate-900">
            {playerName}'s Tile Tray
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            ({pieces.filter((p) => !p.used).length} remaining)
          </span>
        </div>

        {/* Rotate & Flip controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRotate}
            title="Rotate 90° (Key: R)"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate {rotation}°</span>
          </button>
          <button
            onClick={onFlip}
            title="Flip Horizontal (Key: F)"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip</span>
          </button>
        </div>
      </div>

      {/* Selected Piece Highlight / Preview */}
      {selectedPiece && transformedMatrix && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${transformedMatrix[0].length}, minmax(0, 1fr))`,
                }}
              >
                {transformedMatrix.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`preview-${r}-${c}`}
                      className="w-3.5 h-3.5 rounded-xs"
                      style={{
                        backgroundColor: val === 1 ? playerColorHex : 'transparent',
                      }}
                    />
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{selectedPiece.name}</div>
              <div className="text-[11px] font-mono text-slate-500">
                {selectedPiece.size} Squares · {rotation}° {flipped ? 'Flipped' : ''}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Click any cell on the board to place this piece
          </div>
        </div>
      )}

      {/* Horizontal Pieces Scroll Area */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
        {pieces.map((piece) => {
          const isSelected = selectedPieceId === piece.id;
          return (
            <button
              key={piece.id}
              disabled={piece.used}
              onClick={() => onSelectPiece(piece.id)}
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center shrink-0 min-w-[54px] min-h-[54px] transition-all cursor-pointer ${
                piece.used
                  ? 'opacity-20 border-slate-200 bg-slate-100 cursor-not-allowed'
                  : isSelected
                  ? 'border-slate-900 bg-white ring-2 ring-slate-900/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className="grid gap-[1px]"
                style={{
                  gridTemplateColumns: `repeat(${piece.matrix[0].length}, minmax(0, 1fr))`,
                }}
              >
                {piece.matrix.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`icon-${piece.id}-${r}-${c}`}
                      className="w-2 h-2 rounded-xs"
                      style={{
                        backgroundColor:
                          val === 1 ? (piece.used ? '#94a3b8' : playerColorHex) : 'transparent',
                      }}
                    />
                  ))
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-600 mt-1 truncate max-w-[46px]">
                {piece.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
