import React from 'react';
import { PlayerProfile } from '../types/game';

interface PlayerCardProps {
  player: PlayerProfile;
  score: number;
  isActive: boolean;
  isVictimOrPersecutor?: 'victim' | 'persecutor' | null;
  hasConsensus: boolean;
  onSelect?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  score,
  isActive,
  isVictimOrPersecutor,
  hasConsensus,
  onSelect,
}) => {
  const targetScore = 50;
  const maxScore = 89;
  const progressPercent = Math.min(100, Math.round((score / targetScore) * 100));

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all duration-200 select-none cursor-pointer ${
        isActive
          ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/15'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Active turn indicator */}
      {isActive && (
        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-white shadow-xs">
          Active Turn
        </span>
      )}

      {/* Header Info matching reference image */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-xs"
            style={{ backgroundColor: player.colorHex }}
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {player.name}
            </h3>
            <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400 block mt-0.5">
              {player.role}
            </span>
          </div>
        </div>

        {/* Large Score display */}
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-slate-900 leading-none">
            {score}
            <span className="text-xs text-slate-400 font-normal"> / {maxScore}</span>
          </div>
        </div>
      </div>

      {/* Politeness Token Concept & Penalty Status */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">Politeness Tokens:</span>
        <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
          {Array.from({ length: 3 }).map((_, idx) => (
            <span
              key={idx}
              className={`text-xs ${
                idx < player.politenessTokens ? 'opacity-100' : 'opacity-25 grayscale'
              }`}
              title="Politeness Token: -3 penalty squares if lost"
            >
              🪙
            </span>
          ))}
          <span className="text-[10px] text-slate-500 ml-1">
            ({player.politenessTokens}/3)
          </span>
        </div>
      </div>

      {/* Progress to 50-Point Consensus */}
      <div className="space-y-1 mt-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Target Consensus: 50 pts</span>
          <span className={hasConsensus ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
            {hasConsensus ? '✓ Reached Goal' : `${score} / 50`}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden relative">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: hasConsensus ? '#10b981' : player.colorHex,
            }}
          />
        </div>
      </div>

      {/* Role tag badge if in active conflict */}
      {isVictimOrPersecutor && (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-center py-1 rounded bg-slate-50 border border-slate-200">
          {isVictimOrPersecutor === 'persecutor' ? (
            <span className="text-red-600 font-bold">🔥 Conflict Initiator (Persecutor)</span>
          ) : (
            <span className="text-amber-700 font-bold">🛡️ Targeted Territory (Victim)</span>
          )}
        </div>
      )}
    </div>
  );
};
