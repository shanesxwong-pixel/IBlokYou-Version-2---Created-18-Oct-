import React, { useState } from 'react';
import { HistoryEvent, HistoryCategory } from '../types/multiplayer';
import { PLAYERS } from '../data/storylineScript';
import {
  Clock,
  RotateCcw,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEvent[];
  isHost: boolean;
  onRollback: (sequence: number) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  isHost,
  onRollback,
}) => {
  const [filter, setFilter] = useState<'all' | HistoryCategory>('all');
  const [confirmRollbackSeq, setConfirmRollbackSeq] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredHistory = [...history]
    .reverse()
    .filter((event) => (filter === 'all' ? true : event.category === filter));

  const getCategoryBadge = (category: HistoryCategory) => {
    switch (category) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Positive</span>
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            <span>Conflict / Action</span>
          </span>
        );
      case 'neutral':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            <HelpCircle className="w-3 h-3" />
            <span>Neutral</span>
          </span>
        );
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in text-slate-900">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Match Action History</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {history.length} Events
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authoritative chronological record of tile drops, negotiations, and host interventions.
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

        {/* Filter Controls */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600 mr-1">Filter:</span>
            {(['all', 'positive', 'neutral', 'negative'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  filter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>

          {isHost && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Host Rollback Enabled</span>
            </div>
          )}
        </div>

        {/* Scrollable Event List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No matching events found in history.
            </div>
          ) : (
            filteredHistory.map((event) => {
              const pConfig = PLAYERS[event.playerId];
              const isConfirming = confirmRollbackSeq === event.sequence;

              return (
                <div
                  key={event.sequence}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        #{event.sequence}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatTime(event.timestamp)}
                      </span>
                      {getCategoryBadge(event.category)}
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-xs"
                          style={{ backgroundColor: pConfig?.colorHex || '#64748b' }}
                        />
                        <span>{event.playerName}</span>
                        {event.playerCode && (
                          <span className="text-[10px] font-mono text-slate-400 font-normal">
                            ({event.playerCode})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-medium pl-1">
                      {event.description}
                    </p>
                  </div>

                  {/* Host Rollback Action */}
                  {isHost && (
                    <div className="shrink-0 flex items-center gap-1">
                      {isConfirming ? (
                        <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-lg border border-amber-300">
                          <button
                            onClick={() => {
                              onRollback(event.sequence);
                              setConfirmRollbackSeq(null);
                            }}
                            className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Confirm Rollback
                          </button>
                          <button
                            onClick={() => setConfirmRollbackSeq(null)}
                            className="px-1.5 py-1 text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRollbackSeq(event.sequence)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-300 transition-colors cursor-pointer"
                          title="Rollback board and scores to this snapshot"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rollback Here</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Server authoritative snapshot history</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
