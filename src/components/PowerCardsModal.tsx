import React, { useState } from 'react';
import { POWER_CARDS } from '../data/storylineScript';
import { sound } from '../utils/audio';
import { RefreshCw, Shield, Zap, X, Check, HeartHandshake, Award } from 'lucide-react';

interface PowerCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateCard?: (cardId: string) => void;
}

export const PowerCardsModal: React.FC<PowerCardsModalProps> = ({
  isOpen,
  onClose,
  onActivateCard,
}) => {
  const [activeTab, setActiveTab] = useState<'change-swap' | 'force-keep' | 'touch-me-not' | 'politeness'>('change-swap');

  if (!isOpen) return null;

  const handleCardClick = (id: 'change-swap' | 'force-keep' | 'touch-me-not' | 'politeness') => {
    setActiveTab(id);
    sound.playTilePlace();
  };

  const handleExecuteActivation = (id: string) => {
    sound.playPowerCardShimmer();
    if (onActivateCard) onActivateCard(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-300 p-6 shadow-2xl relative overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">iBlokYou Power Cards & Politeness Framework</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Collaborative intervention mechanisms and Face-Saving strategies to overcome aggression.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => handleCardClick('change-swap')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'change-swap'
                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 shadow-xs'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-700">
              CARD 1
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
              Change Swap
            </div>
          </button>

          <button
            onClick={() => handleCardClick('force-keep')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'force-keep'
                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 shadow-xs'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700">
              CARD 2
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
              Force Keep
            </div>
          </button>

          <button
            onClick={() => handleCardClick('touch-me-not')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'touch-me-not'
                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 shadow-xs'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700">
              CARD 3
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
              Touch-Me-Not
            </div>
          </button>

          <button
            onClick={() => handleCardClick('politeness')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'politeness'
                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 shadow-xs'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-700">
              ETHICS
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
              Politeness & Face
            </div>
          </button>
        </div>

        {/* Card Details View */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          {activeTab === 'change-swap' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-bold">
                <RefreshCw className="w-4 h-4" />
                <span>Power Card 1: Change Swap (Reciprocal Trade)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Initiate a consensual tile exchange between cooperating players. Both players exchange agreed polyomino shapes, rotating and flipping to fit constricted diagonal corner angles.
              </p>
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-900">Application:</strong> Liam and Chloe swapped tiles, enabling Chloe to unlock an expansive corridor toward the lower quadrant.
              </div>
            </div>
          )}

          {activeTab === 'force-keep' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-700 text-sm font-bold">
                <Zap className="w-4 h-4" />
                <span>Power Card 2: Force Keep (Bonus Move Advantage)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Replace agreed tiles with an ally. The player willing to trade gains an
                <strong> immediate additional move on their next turn</strong> to secure vulnerable borders against aggressive cut-offs.
              </p>
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-900">Application:</strong> Chloe traded with Maya, granting Maya a double turn to reinforce the southeast border.
              </div>
            </div>
          )}

          {activeTab === 'touch-me-not' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                <Shield className="w-4 h-4" />
                <span>Power Card 3: Touch-Me-Not (Defensive Geometric Shield)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Player 2 suggests Player 3 or 4 to drop the pre-defined <strong>Touch-Me-Not</strong> boundary shield (Cross-5 / X-pento). It completely halts Player 1's invasive vanguard while preserving legal non-aggressive avenues.
              </p>

              {/* Cross Shape Mini-Preview */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center gap-4">
                <div className="grid grid-cols-3 gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded">
                  <div className="w-3.5 h-3.5 bg-transparent" />
                  <div className="w-3.5 h-3.5 bg-emerald-600 rounded-xs" />
                  <div className="w-3.5 h-3.5 bg-transparent" />
                  <div className="w-3.5 h-3.5 bg-emerald-600 rounded-xs" />
                  <div className="w-3.5 h-3.5 bg-emerald-600 rounded-xs" />
                  <div className="w-3.5 h-3.5 bg-emerald-600 rounded-xs" />
                  <div className="w-3.5 h-3.5 bg-transparent" />
                  <div className="w-3.5 h-3.5 bg-emerald-600 rounded-xs" />
                  <div className="w-3.5 h-3.5 bg-transparent" />
                </div>
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Touch-Me-Not Cross Shape:</span> Enforces an impenetrable boundary without suffocating the opponent's legitimate score avenues.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'politeness' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-700 text-sm font-bold">
                <HeartHandshake className="w-4 h-4" />
                <span>Politeness Tokens & Face-Saving Strategy</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 space-y-2">
                <p>
                  <strong>1. The Politeness Token Concept:</strong> Each player starts with 3 Politeness Tokens (🪙🪙🪙). Persistent uncooperative taunting or aggressive chokes deplete a token, threatening a <strong>-3 penalty deduction</strong> from their final score at endgame.
                </p>
                <p>
                  <strong>2. Positive Politeness & Face-Saving:</strong> When Player 1 is halted, rather than humiliating him, Liam applies Positive Politeness (Brown & Levinson's framework). Liam acknowledges Player 1's strategic strength and guarantees him space to achieve 52 points.
                </p>
                <p className="text-purple-800 font-semibold">
                  Result: Mutual Benefit Achieved. Derrick saves face, the penalty is waived, and all four players celebrate crossing the 50-point consensus mark!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">All power cards integrate Face-Saving assertiveness.</span>
          {activeTab !== 'politeness' ? (
            <button
              onClick={() => handleExecuteActivation(activeTab)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Deploy {activeTab === 'change-swap' ? 'Change Swap' : activeTab === 'force-keep' ? 'Force Keep' : 'Touch-Me-Not'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold bg-slate-900 text-white cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
