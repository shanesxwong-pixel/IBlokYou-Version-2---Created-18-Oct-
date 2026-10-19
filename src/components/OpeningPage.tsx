import React, { useState, useEffect } from 'react';
import { HostSettings } from '../types/multiplayer';
import {
  Users,
  Compass,
  Play,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Settings,
  Layers,
} from 'lucide-react';

interface OpeningPageProps {
  onCreateRoom: (playerName: string, settings?: Partial<HostSettings>) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  publicAppUrl: string;
  version: string;
}

export const OpeningPage: React.FC<OpeningPageProps> = ({
  onCreateRoom,
  onJoinRoom,
  publicAppUrl,
  version,
}) => {
  // Active Room Code state with URL query parameter preservation (?room=N5C7)
  const [roomCode, setRoomCode] = useState('N5C7');
  const [selectedSeat, setSelectedSeat] = useState<'red' | 'blue' | 'green' | 'yellow'>('red');

  // Four editable player alias fields
  const [nameRed, setNameRed] = useState('Strategic Red');
  const [nameBlue, setNameBlue] = useState('Tactical Blue');
  const [nameGreen, setNameGreen] = useState('Diplomatic Green');
  const [nameYellow, setNameYellow] = useState('Resilient Yellow');

  // Guest join state
  const [guestName, setGuestName] = useState('');
  const [guestRoomCode, setGuestRoomCode] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // Read, validate, and preserve the URL room parameter query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join');
    if (roomParam && roomParam.trim()) {
      const code = roomParam.trim().toUpperCase();
      setRoomCode(code);
      setGuestRoomCode(code);
    } else {
      // Default to N5C7 and preserve in URL
      const defaultCode = 'N5C7';
      setRoomCode(defaultCode);
      setGuestRoomCode(defaultCode);
      preserveRoomInUrl(defaultCode);
    }
  }, []);

  const preserveRoomInUrl = (code: string) => {
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${encodeURIComponent(code)}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  };

  const handleRoomCodeChange = (newCode: string) => {
    const clean = newCode.toUpperCase().trim();
    setRoomCode(clean);
    preserveRoomInUrl(clean);
  };

  const handleCopyShareUrl = () => {
    const url = `${publicAppUrl.split('?')[0]}?room=${encodeURIComponent(roomCode)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLockAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    preserveRoomInUrl(roomCode);

    // Save persistent aliases in localStorage
    localStorage.setItem('iblokyou_name_red', nameRed);
    localStorage.setItem('iblokyou_name_blue', nameBlue);
    localStorage.setItem('iblokyou_name_green', nameGreen);
    localStorage.setItem('iblokyou_name_yellow', nameYellow);

    // Select chosen seat display name
    const seatNames = { red: nameRed, blue: nameBlue, green: nameGreen, yellow: nameYellow };
    const myName = seatNames[selectedSeat] || nameRed;

    localStorage.setItem('iblokyou_player_name', myName);
    onCreateRoom(myName);
  };

  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestName.trim() || 'Guest Player';
    const code = guestRoomCode.trim().toUpperCase();
    if (!code) return;
    preserveRoomInUrl(code);
    onJoinRoom(code, name);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-8 px-4 text-slate-900 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                iBlokYou
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Conflict Management Edition
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {version}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Mathematical state matrix engine with 5 Power Cards, Flood-Fill hijacking, and Politeness consensus scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/iblokyou.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors"
              title="Launch pure single-file Conflict Management Edition HTML in new tab"
            >
              <span>📄 Open Standalone .html</span>
            </a>

            <a
              href="/download/iblokyou.html"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="Download standalone HTML file for examiner submission"
            >
              <span>💾 Download .html</span>
            </a>

            <button
              onClick={handleCopyShareUrl}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Room URL'}</span>
            </button>
          </div>
        </div>

        {/* 1. INITIAL START VIEW (ROOM CODE + EDITABLE ALIASES) */}
        <div className="mt-6 space-y-5">
          <form onSubmit={handleLockAndStart} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Player Configuration & Room Setup</h3>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-xs">
                <span className="font-semibold text-slate-600">Active Room Code:</span>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => handleRoomCodeChange(e.target.value)}
                  maxLength={8}
                  className="w-20 font-mono font-black text-slate-900 uppercase focus:outline-none"
                  title="Preserved in URL query string (?room=...)"
                />
              </div>
            </div>

            <p className="text-xs text-slate-600">
              All four player aliases are completely editable. Each player is issued exactly 3 distinct power card moves per game:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Player 1 Red */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="w-3 h-3 rounded-full bg-[#e74c3c]" />
                    <span>Player 1 (Red · Top-Left 0,0)</span>
                  </div>
                  <input
                    type="radio"
                    name="seat"
                    checked={selectedSeat === 'red'}
                    onChange={() => setSelectedSeat('red')}
                    title="Play as Player 1"
                    className="cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={nameRed}
                  onChange={(e) => setNameRed(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Player 2 Blue */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="w-3 h-3 rounded-full bg-[#3498db]" />
                    <span>Player 2 (Blue · Bottom-Right 19,19)</span>
                  </div>
                  <input
                    type="radio"
                    name="seat"
                    checked={selectedSeat === 'blue'}
                    onChange={() => setSelectedSeat('blue')}
                    title="Play as Player 2"
                    className="cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={nameBlue}
                  onChange={(e) => setNameBlue(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Player 3 Green */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="w-3 h-3 rounded-full bg-[#2ecc71]" />
                    <span>Player 3 (Green · Top-Right 0,19)</span>
                  </div>
                  <input
                    type="radio"
                    name="seat"
                    checked={selectedSeat === 'green'}
                    onChange={() => setSelectedSeat('green')}
                    title="Play as Player 3"
                    className="cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={nameGreen}
                  onChange={(e) => setNameGreen(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Player 4 Yellow */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="w-3 h-3 rounded-full bg-[#f1c40f]" />
                    <span>Player 4 (Yellow · Bottom-Left 19,0)</span>
                  </div>
                  <input
                    type="radio"
                    name="seat"
                    checked={selectedSeat === 'yellow'}
                    onChange={() => setSelectedSeat('yellow')}
                    title="Play as Player 4"
                    className="cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={nameYellow}
                  onChange={(e) => setNameYellow(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-black text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Play className="w-4 h-4 fill-current text-emerald-400" />
              <span>Lock Names & Initialize Board</span>
            </button>
          </form>

          {/* Guest Direct Join Box */}
          <form onSubmit={handleGuestJoin} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Join Existing Match as Guest:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
              <input
                type="text"
                placeholder="Your Display Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs w-36"
              />
              <input
                type="text"
                placeholder="Room Code"
                value={guestRoomCode}
                onChange={(e) => setGuestRoomCode(e.target.value.toUpperCase())}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold w-24 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Join Room
              </button>
            </div>
          </form>
        </div>

        {/* AI & License Footer Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Open Source under Apache License 2.0 (SPDX-License-Identifier: Apache-2.0).</span>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Created with Google AI Studio. Mathematical State Matrix Engine.</span>
          </div>
        </div>
      </div>

      {/* 9 Step Rules Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">How to Play iBlokYou (5 Verified Power Mechanics)</h2>
              <p className="text-xs text-slate-500">Conflict-to-Consensus Strategy & Politeness Scoring Routine</p>
            </div>
          </div>

          <button
            onClick={() => setIsRulesExpanded(!isRulesExpanded)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            {isRulesExpanded ? 'Collapse' : 'Expand All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">Power Card 1</span>
            <h4 className="text-xs font-bold text-slate-900">🔄 Consensual Swap Card</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designate target, click own block (Purple), opponent clicks block (Cyan) via Flood-Fill. Acceptance awards +1 Politeness Token (-3 penalty).
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-orange-700 uppercase">Power Card 2</span>
            <h4 className="text-xs font-bold text-slate-900">🎯 Force Keep Hijack</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target an opponent's tile cluster. Recursive Flood-Fill locks structural ownership to the active player to secure pieces against blocking.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">Power Card 3</span>
            <h4 className="text-xs font-bold text-slate-900">📖 Open Book (Trust Immunity)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reveals opponent reserves face-up. Grants Trust Immunity for 2 full rounds (8 steps) preventing opponent placements adjacent to your matrix.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-700 uppercase">Power Card 4</span>
            <h4 className="text-xs font-bold text-slate-900">🧱 Boundary Wall</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Erects neutral grey barricades (#7f8c8d) blocking all players. Triggers a Circumscribing Penalty causing the caster to skip their next turn.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">Power Card 5</span>
            <h4 className="text-xs font-bold text-slate-900">🌉 Third-Party Bridge</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Constructs a neutral teal bridge (#16a085) over an empty slot. Overrides standard adjacency enabling collaborative diagonal passage.
            </p>
          </div>

          {/* Rule 6 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Scoring Engine</span>
            <h4 className="text-xs font-bold text-slate-900">💡 Politeness Scoring</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Total Penalty = (Unplaced squares) - (Tokens × 3). Lowest penalty score wins, rewarding face-saving and mutual consensus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
