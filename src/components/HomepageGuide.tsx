import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Play,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Award,
  Download,
  AlertTriangle,
  RotateCw,
  Compass,
  HeartHandshake,
  Coins,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HomepageGuideProps {
  onStartGame: () => void;
  onOpenDocs: () => void;
  publicAppUrl: string;
  version: string;
}

export const HomepageGuide: React.FC<HomepageGuideProps> = ({
  onStartGame,
  onOpenDocs,
  publicAppUrl,
  version,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopiedLink(true);
    sound.playTilePlace();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 sm:py-6 animate-fade-in text-slate-900">
      {/* EXAMINER NOTICE & AI DISCLOSURE BANNER */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">
                Examiner Assessment Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {version}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              iBlokYou: Conflict to Consensus
            </h1>
            <p className="text-sm text-slate-500">
              Interactive 4-Player Tabletop Game Simulation · Politeness Tokens & Face-Saving Strategy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/iblokyou.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-300"
              title="Launch pure single-file Conflict Management Edition HTML in new tab"
            >
              <span>📄 Standalone .html</span>
            </a>

            <a
              href="/download/iblokyou.html"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
              title="Download standalone HTML file for examiner submission"
            >
              <span>💾 Download .html</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-300"
              title="Copy Public HTML5 Game URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Game Link'}</span>
            </button>

            <a
              href={publicAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Window</span>
            </a>

            <button
              onClick={onStartGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-black text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch iBlokYou</span>
            </button>
          </div>
        </div>

        {/* AI & License Disclosure Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Creation Disclosure</span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              This application and interactive simulation were created with <strong>Google AI Studio</strong>. Built with React 19, TypeScript, and Tailwind CSS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>License & Compliance</span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Released under the <strong>Apache License 2.0</strong> (SPDX-License-Identifier: Apache-2.0). All assets and audio are browser-synthesized.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Public Live HTML Link</span>
            </div>
            <p className="text-xs font-mono text-slate-700 mt-1.5 truncate bg-white p-1.5 rounded border border-slate-200">
              {publicAppUrl}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Pure .html file and online accessibility ready for review.
            </p>
          </div>
        </div>
      </section>

      {/* THE AIM OF THE GAME */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Aim of iBlokYou</h2>
            <p className="text-xs text-slate-500">From zero-conflict baseline to collaborative 50+ consensus</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-r from-amber-50/80 via-white to-blue-50/80 border border-amber-200/70 text-sm leading-relaxed text-slate-800 space-y-2">
          <p className="font-semibold text-slate-900 text-base">
            "Aim: To move from an intense 4-player condition in the iBlokYou game at starting point 'Zero Conflict', to a consensus reached where all players achieve a minimum of 50 points."
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            In typical competitive games, zero-sum aggression causes losers to be completely shut down. iBlokYou shifts the narrative: Derrick (Player 1 / Persecutor) attempts to choke Chloe (Player 2 / Victim). Liam (Player 3 / Rescuer) and Maya (Player 4 / Ally) step in with assertive boundary-setting, deploying Power Cards (Change Swap, Force Keep, Touch-Me-Not) and Face-Saving techniques. Ultimately, all four players cross the 50-point consensus mark (Derrick: 52, Chloe: 54, Liam: 56, Maya: 53)!
          </p>
          <div className="pt-2 text-xs font-semibold text-amber-900 border-t border-amber-200/60">
            Ethical Takeaway: <em>"Do not be aggressive. Be assertive in playing the iBlokYou game, no matter how others remark or suggest to play the game. If no solution is reached, then use the Power Card in your advantage."</em>
          </div>
        </div>
      </section>

      {/* POLITENESS TOKEN & FACE-SAVING STRATEGY SECTION */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <HeartHandshake className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Politeness Tokens & Face-Saving Strategy</h2>
            <p className="text-xs text-slate-500">How interpersonal pragmatics achieves mutual benefit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>1. The Politeness Token Concept (-3 Penalty)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every player starts with <strong>3 Politeness Tokens (🪙🪙🪙)</strong>. When a player engages in hostile taunting, unprovoked verbal attacks, or predatory suffocating blocks (such as Derrick's 30-point cut-off), they forfeit a Politeness Token. If tokens are not redeemed by the endgame, a <strong>penalty of 3 squares (-3 points)</strong> is deducted from their final score!
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase">
              <HeartHandshake className="w-4 h-4 text-purple-600" />
              <span>2. Positive Politeness & Face-Saving</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on Brown & Levinson’s Politeness Theory, when Derrick is successfully surrounded, Liam and Chloe <strong>refuse to humiliate him</strong>. Instead, they apply <em>Positive Politeness & Face-Saving</em>: validating Derrick's tactical prowess, offering cooperative trades, and guaranteeing he reaches 52 points. Derrick saves face, the penalty is redeemed, and <strong>mutual benefit is achieved</strong> for everyone!
            </p>
          </div>
        </div>
      </section>

      {/* HOW TO PLAY THE GAME (VISUAL RULES & DIAGRAMS) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">How to Play iBlokYou (Illustrated Tutorial)</h2>
              <p className="text-xs text-slate-500">Core polyomino placement rules and conflict mechanics</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            20×20 Matrix · 21 Pieces · 89 Max Pts
          </span>
        </div>

        {/* 4 Illustrated Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Rule 1: Starting Corner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">1. Corner Start (Zero Conflict)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                MANDATORY
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The very first tile played by each player <strong>must cover their assigned corner</strong> on the 20×20 board.
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-around gap-2 text-center text-[10px]">
              <div>
                <div className="w-10 h-10 border border-slate-300 grid grid-cols-2 gap-0.5 p-0.5 bg-slate-50 rounded">
                  <div className="bg-blue-600 rounded-xs" />
                  <div className="bg-blue-600 rounded-xs" />
                  <div className="bg-blue-600 rounded-xs" />
                  <div className="bg-transparent" />
                </div>
                <span className="text-slate-500 mt-1 block font-mono">P1 Corner (0,0)</span>
              </div>
              <div className="text-slate-400 font-bold">→</div>
              <div>
                <div className="w-10 h-10 border border-slate-300 grid grid-cols-2 gap-0.5 p-0.5 bg-slate-50 rounded">
                  <div className="bg-transparent" />
                  <div className="bg-amber-500 rounded-xs" />
                  <div className="bg-amber-500 rounded-xs" />
                  <div className="bg-amber-500 rounded-xs" />
                </div>
                <span className="text-slate-500 mt-1 block font-mono">P2 Corner (0,19)</span>
              </div>
            </div>
          </div>

          {/* Rule 2: Corner-to-Corner Contact */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">2. Diagonal Corner Touch</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                LEGAL MOVE
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every subsequent piece played must touch <strong>at least one corner</strong> of an existing piece of the <em>same color</em>.
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-4">
              <div className="grid grid-cols-4 grid-rows-3 gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded">
                <div className="w-4 h-4 bg-amber-500 rounded-xs" />
                <div className="w-4 h-4 bg-amber-500 rounded-xs" />
                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-transparent" />

                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-amber-500 rounded-xs" />
                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-transparent" />

                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-amber-500 rounded-xs ring-1 ring-emerald-500" />
                <div className="w-4 h-4 bg-amber-500 rounded-xs" />
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                ✓ Valid: Diagonal corner touch connects yellow piece to yellow piece.
              </div>
            </div>
          </div>

          {/* Rule 3: Edge-to-Edge Contact Forbidden (Same Color) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">3. Edge Contact (Same Color)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                STRICTLY FORBIDDEN
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pieces of the <strong>same color can NEVER touch along an edge</strong> (orthogonally). Only corner contact is valid.
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-4">
              <div className="grid grid-cols-3 grid-rows-2 gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded">
                <div className="w-4 h-4 bg-red-600 rounded-xs" />
                <div className="w-4 h-4 bg-red-600 rounded-xs" />
                <div className="w-4 h-4 bg-transparent" />

                <div className="w-4 h-4 bg-red-600 rounded-xs ring-2 ring-red-500" />
                <div className="w-4 h-4 bg-red-600 rounded-xs ring-2 ring-red-500" />
                <div className="w-4 h-4 bg-transparent" />
              </div>
              <div className="text-xs text-red-700 font-medium">
                ✗ Invalid: Touching edges of same color is illegal in iBlokYou!
              </div>
            </div>
          </div>

          {/* Rule 4: Opponent Edge Contact (Blocking Mechanic) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">4. Opponent Edge Contact</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                CONFLICT TRIGGER
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Edge contact with <strong>different colors is permitted</strong>, which triggers blocking and territorial conflict.
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-4">
              <div className="grid grid-cols-3 grid-rows-2 gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded">
                <div className="w-4 h-4 bg-blue-600 rounded-xs" />
                <div className="w-4 h-4 bg-blue-600 rounded-xs" />
                <div className="w-4 h-4 bg-amber-500 rounded-xs" />

                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-transparent" />
                <div className="w-4 h-4 bg-amber-500 rounded-xs" />
              </div>
              <div className="text-xs text-purple-700 font-medium">
                ⚡ Legal Block: Blue walls off Yellow’s corridor by placing edge-to-edge.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE THREE POWER CARDS */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>⚡ The Three Power Cards</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="text-xs font-bold text-blue-700 uppercase">Power Card 1: Change Swap</div>
            <p className="text-xs text-slate-600">
              Initiate a consensual tile exchange between allies. Rotate and flip pieces to fit tight diagonal corridors.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="text-xs font-bold text-amber-700 uppercase">Power Card 2: Force Keep</div>
            <p className="text-xs text-slate-600">
              Replace agreed tiles with an ally. The player willing to trade gains an <strong>additional move on their next turn</strong>.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="text-xs font-bold text-emerald-700 uppercase">Power Card 3: Touch-Me-Not</div>
            <p className="text-xs text-slate-600">
              Drops the pre-defined <strong>Touch-Me-Not</strong> Cross-5 shield shape, creating a boundary that neutralizes aggression.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Ready to begin the playtest?</h3>
          <p className="text-xs text-slate-500">
            Start at Stage 0 with Scissors-Paper-Stone, or advance through the 3 conflict rounds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDocs}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            Review Playtest Timestamps & README
          </button>
          <button
            onClick={onStartGame}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-black text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Game Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
