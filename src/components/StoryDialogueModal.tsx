import React from 'react';
import { StoryDialogue } from '../types/game';
import { PLAYERS } from '../data/storylineScript';
import { AlertCircle, ShieldAlert, Sparkles, Trophy, ArrowRight, X } from 'lucide-react';

interface StoryDialogueModalProps {
  dialogue: StoryDialogue;
  stageTitle: string;
  timestampStr: string;
  onContinue: () => void;
  isConflictTrigger?: boolean;
  powerCardName?: string;
}

export const StoryDialogueModal: React.FC<StoryDialogueModalProps> = ({
  dialogue,
  stageTitle,
  timestampStr,
  onContinue,
  isConflictTrigger,
  powerCardName,
}) => {
  const player = dialogue.speakerId !== 'narrator' ? PLAYERS[dialogue.speakerId] : null;

  const getEmotionBadge = () => {
    switch (dialogue.emotion) {
      case 'aggressive':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Aggressive Move
          </span>
        );
      case 'shy':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold">
            Shy / Peaceful
          </span>
        );
      case 'assertive':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" /> Assertive Intervention
          </span>
        );
      case 'face-saving':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Face-Saving Strategy
          </span>
        );
      case 'triumphant':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-600" /> Consensus Milestone
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-300 p-6 shadow-2xl relative overflow-hidden"
        style={{
          borderTopWidth: '4px',
          borderTopColor: isConflictTrigger
            ? '#dc2626'
            : powerCardName
            ? '#7c3aed'
            : player?.colorHex || '#0f172a',
        }}
      >
        {/* Top Status Header */}
        <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {timestampStr}
            </span>
            <span className="text-xs font-bold text-slate-700 truncate">{stageTitle}</span>
          </div>
          {getEmotionBadge()}
        </div>

        {/* Politeness / Face-Saving note if present */}
        {dialogue.politenessNote && (
          <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{dialogue.politenessNote}</span>
          </div>
        )}

        {/* Conflict Trigger Banner */}
        {isConflictTrigger && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-red-100 text-red-700 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                Scenario Trigger: Conflict Escalation
              </h4>
              <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                Auto-play paused. The blocking piece triggering this territorial dispute is highlighted on the 20×20 board.
              </p>
            </div>
          </div>
        )}

        {/* Power Card Activation Banner */}
        {powerCardName && (
          <div className="mb-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                Special Mechanic: {powerCardName} Activated
              </h4>
              <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">
                Strategic collaborative card played against dominant aggression to restore fair scoring balance.
              </p>
            </div>
          </div>
        )}

        {/* Speaker Profile & Dialogue */}
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs border border-slate-200"
            style={{
              backgroundColor: player ? `${player.colorHex}15` : '#f1f5f9',
            }}
          >
            {player?.avatar || '💬'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {dialogue.speakerName}
              </h3>
              {player && (
                <span className="text-[11px] text-slate-500 font-mono">
                  ({player.role})
                </span>
              )}
            </div>

            <div className="mt-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans shadow-inner">
              "{dialogue.text}"
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span>Proceed with Scenario</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
