import React, { useState } from 'react';
import { RoomState, PlayerId } from '../types/multiplayer';
import { PLAYERS } from '../data/storylineScript';
import {
  Shield,
  Play,
  Pause,
  PlusCircle,
  RotateCcw,
  X,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';

interface HostControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomState;
  onPause: () => void;
  onResume: () => void;
  onGrantExtraTurn: (playerId: PlayerId, reason?: string) => void;
  onOpenHistory: () => void;
}

export const HostControlsModal: React.FC<HostControlsModalProps> = ({
  isOpen,
  onClose,
  roomState,
  onPause,
  onResume,
  onGrantExtraTurn,
  onOpenHistory,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId>('player1');
  const [extraTurnReason, setExtraTurnReason] = useState('Face-saving strategic allowance');
  const [grantedToast, setGrantedToast] = useState(false);

  if (!isOpen) return null;

  const handleGrant = () => {
    onGrantExtraTurn(selectedPlayerId, extraTurnReason);
    setGrantedToast(true);
    setTimeout(() => setGrantedToast(false), 2000);
  };

  const activePlayers = roomState.turnOrder
    .map((pid) => roomState.players[pid])
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in text-slate-900">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Host Command Panel</h3>
              <p className="text-xs text-slate-500">
                Authoritative controls for room <strong>{roomState.roomCode}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Pause / Resume match */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Gameplay State
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Current status:{' '}
                <strong className="text-slate-800 capitalize">{roomState.status}</strong>
              </p>
            </div>

            {roomState.status === 'paused' ? (
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Game</span>
              </button>
            )}
          </div>

          {/* Grant Extra Turn */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Grant Strategic Extra Turn
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allows host to award an extra move to promote consensus or resolve bottlenecks.
                </p>
              </div>
              <PlusCircle className="w-4 h-4 text-purple-600" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Target Player</label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value as PlayerId)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {activePlayers.map((p) => p && (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role} · {p.colorName}) — {p.score} pts
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Strategic Reason</label>
              <input
                type="text"
                value={extraTurnReason}
                onChange={(e) => setExtraTurnReason(e.target.value)}
                placeholder="e.g. Consensus balance assistance"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <button
              onClick={handleGrant}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {grantedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Extra Turn Granted!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Award Extra Turn to {roomState.players[selectedPlayerId]?.name || 'Player'}</span>
                </>
              )}
            </button>
          </div>

          {/* Rollback Link to History */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Rollback & Undo Moves
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Revert the board and scores to any prior event sequence.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Browse Snapshots</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
