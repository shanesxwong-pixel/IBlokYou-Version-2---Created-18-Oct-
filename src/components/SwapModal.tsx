import React, { useState } from 'react';
import { PlayerId, RoomState, SwapProposal } from '../types/multiplayer';
import { PLAYERS } from '../data/storylineScript';
import { RAW_PIECES_DATA } from '../utils/pieces';
import { ArrowRightLeft, X, Check, AlertCircle } from 'lucide-react';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomState;
  yourPlayerId: PlayerId | null;
  selectedTileId: string | null;
  activeSwap: SwapProposal | null;
  onConfirmExchange: (targetPlayerId: PlayerId, offeredPieceId: string, requestedPieceId: string) => void;
  onResolveActiveSwap: (isAccepted: boolean) => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  roomState,
  yourPlayerId,
  selectedTileId,
  activeSwap,
  onConfirmExchange,
  onResolveActiveSwap,
}) => {
  // Other connected players
  const otherPlayerIds = roomState.turnOrder.filter(
    (pid) => pid !== yourPlayerId && roomState.players[pid] !== null && roomState.players[pid]?.isConnected
  );

  const [targetPlayerId, setTargetPlayerId] = useState<PlayerId>(
    otherPlayerIds[0] || 'player2'
  );

  if (!isOpen && !activeSwap) return null;

  // CASE 1: If there's an incoming or active swap proposal from the server
  if (activeSwap) {
    const isRecipient = yourPlayerId === activeSwap.recipientId;
    const isInitiator = yourPlayerId === activeSwap.initiatorId;
    const playerA = roomState.players[activeSwap.initiatorId];
    const playerB = roomState.players[activeSwap.recipientId];

    const pieceA = RAW_PIECES_DATA.find((p) => p.id === activeSwap.terms.offeredPieceId);
    const pieceB = RAW_PIECES_DATA.find((p) => p.id === activeSwap.terms.requestedPieceId);

    const tileALabel = pieceA ? `${pieceA.name}` : 'Tile A';
    const tileBLabel = pieceB ? `${pieceB.name}` : 'Tile B';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in text-slate-900">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-900 w-full max-w-md p-6 text-center space-y-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Tile Exchange via Swap Card
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Trading between <strong>{playerA?.name || 'Player A'}</strong> and{' '}
              <strong>{playerB?.name || 'Player B'}</strong>
            </p>
          </div>

          {/* Clean Binary Conceptual Exchange Slots */}
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="border-2 border-dashed border-slate-500 bg-slate-50 px-4 py-3 rounded-xl font-bold text-sm text-slate-900 shadow-xs">
              <span className="text-[10px] uppercase font-mono block text-slate-500 mb-0.5">
                {playerA?.name}
              </span>
              Tile A ({tileALabel})
            </div>

            <div className="text-2xl font-bold text-slate-400 select-none">⇄</div>

            <div className="border-2 border-dashed border-slate-500 bg-slate-50 px-4 py-3 rounded-xl font-bold text-sm text-slate-900 shadow-xs">
              <span className="text-[10px] uppercase font-mono block text-slate-500 mb-0.5">
                {playerB?.name}
              </span>
              Tile B ({tileBLabel})
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {isRecipient
              ? 'ACTION REQUIRED: Do you accept or reject this tile exchange?'
              : isInitiator
              ? 'Awaiting response from negotiation partner...'
              : 'Processing interaction between players...'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {isRecipient ? (
              <>
                <button
                  onClick={() => onResolveActiveSwap(true)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#2ecc71] hover:bg-[#27ae60] text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Confirm Exchange
                </button>
                <button
                  onClick={() => onResolveActiveSwap(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#e74c3c] hover:bg-[#c0392b] text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Reject Exchange
                </button>
              </>
            ) : isInitiator ? (
              <button
                onClick={() => onResolveActiveSwap(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              >
                Cancel Exchange Request
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono">Turn locked during swap</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: Initiating a New Swap
  const playerA = yourPlayerId ? roomState.players[yourPlayerId] : null;
  const playerB = roomState.players[targetPlayerId];

  // Tile A: current selected tile
  const pieceA = RAW_PIECES_DATA.find((p) => p.id === selectedTileId) || playerA?.pieces.find((p) => !p.used);
  // Tile B: conceptual target tile from player B
  const pieceB = playerB?.pieces.find((p) => !p.used);

  const tileALabel = pieceA ? pieceA.name : 'Tile A';
  const tileBLabel = pieceB ? pieceB.name : 'Tile B';

  const handleConfirm = () => {
    if (!pieceA || !pieceB || !targetPlayerId) return;
    onConfirmExchange(targetPlayerId, pieceA.id, pieceB.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in text-slate-900">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-900 w-full max-w-md p-6 text-center space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900 text-left">
            Tile Exchange via Swap Card
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 2 in flow: [Select Target Player] */}
        <div className="text-left space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            1. Select Trade Partner
          </label>
          <div className="grid grid-cols-3 gap-2">
            {otherPlayerIds.map((pid) => {
              const p = roomState.players[pid];
              const isSelected = targetPlayerId === pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setTargetPlayerId(pid)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p?.colorHex || '#94a3b8' }}
                    />
                    <span className="text-xs font-bold truncate">{p?.name}</span>
                  </div>
                  <span className="text-[10px] opacity-75 block mt-0.5">
                    {p?.score || 0} pts
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4 in flow: [A / B Prompt] */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-slate-700 text-left uppercase tracking-wide">
            2. Conceptual Exchange Prompt
          </span>
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 px-4 py-3 rounded-xl font-bold text-xs text-slate-900">
              <span className="text-[9px] uppercase font-mono block text-slate-500 mb-0.5">
                You Give
              </span>
              Tile A ({tileALabel})
            </div>

            <div className="text-xl font-bold text-slate-400 select-none">⇄</div>

            <div className="border-2 border-dashed border-slate-400 bg-slate-50 px-4 py-3 rounded-xl font-bold text-xs text-slate-900">
              <span className="text-[9px] uppercase font-mono block text-slate-500 mb-0.5">
                {playerB?.name || 'Partner'} Gives
              </span>
              Tile B ({tileBLabel})
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Clicking Confirm sends the trade prompt. When accepted, legal placement guides will highlight on the board.
        </p>

        {/* Direct Binary Response Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#2ecc71] hover:bg-[#27ae60] text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Confirm Exchange
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#e74c3c] hover:bg-[#c0392b] text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Reject / Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
