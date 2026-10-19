import React, { useState } from 'react';
import { RoomState, PlayerId, HostSettings } from '../types/multiplayer';
import {
  Copy,
  Check,
  Users,
  Play,
  Shield,
  Clock,
  Sparkles,
  Share2,
  Lock,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface LobbyViewProps {
  roomState: RoomState;
  yourPlayerId: PlayerId | null;
  isHost: boolean;
  onSetReady: (ready: boolean) => void;
  onUpdateSettings: (settings: Partial<HostSettings>) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  publicAppUrl: string;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomState,
  yourPlayerId,
  isHost,
  onSetReady,
  onUpdateSettings,
  onStartGame,
  onLeaveRoom,
  publicAppUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const roomShareUrl = `${publicAppUrl.split('?')[0]}?room=${roomState.roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activePlayers = roomState.turnOrder
    .map((pid) => roomState.players[pid])
    .filter(Boolean);

  const yourPlayer = yourPlayerId ? roomState.players[yourPlayerId] : null;

  const handleToggleSetting = (key: keyof HostSettings) => {
    if (!isHost) return;
    onUpdateSettings({
      [key]: !roomState.settings[key],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 animate-fade-in text-slate-900">
      {/* Lobby Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900">Game Lobby</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Room: {roomState.roomCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Share the room link or code with 3 players to fill all 4 slots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Code' : `Code: ${roomState.roomCode}`}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            <button
              onClick={onLeaveRoom}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            >
              Leave
            </button>
          </div>
        </div>

        {/* 4 Player Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-6">
          {roomState.turnOrder.map((pid, idx) => {
            const player = roomState.players[pid];
            const isYou = yourPlayerId === pid;

            return (
              <div
                key={pid}
                className={`p-4 rounded-xl border transition-all ${
                  player
                    ? 'bg-slate-50 border-slate-300 shadow-xs'
                    : 'bg-white border-dashed border-slate-200 opacity-60'
                } ${isYou ? 'ring-2 ring-slate-900 bg-white' : ''}`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Slot {idx + 1}
                  </span>
                  {player?.isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold" title="Connected">
                      <Wifi className="w-3 h-3" />
                      <span>Online</span>
                    </span>
                  ) : player ? (
                    <span className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold" title="Disconnected">
                      <WifiOff className="w-3 h-3" />
                      <span>Offline</span>
                    </span>
                  ) : null}
                </div>

                {player ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: player.colorHex }}
                      />
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {player.name}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                      <span>Code: {player.code}</span>
                      {player.isHost && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          HOST
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Status:</span>
                      {player.isReady ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Not Ready</span>
                        </span>
                      )}
                    </div>

                    {isYou && (
                      <div className="text-[10px] text-center font-bold text-blue-700 bg-blue-50 py-0.5 rounded border border-blue-200 mt-1">
                        YOU
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    Waiting for player to join...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Settings & Rules Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Host Settings & Active Rules</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {isHost ? 'Host Permissions Active' : 'Read-Only (Host Configures)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Checkbox 1: Force Keep */}
          <label
            onClick={() => handleToggleSetting('enableForceKeep')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              isHost ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
            } ${roomState.settings.enableForceKeep ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50'}`}
          >
            <input
              type="checkbox"
              checked={roomState.settings.enableForceKeep}
              disabled={!isHost}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Enable Force Keep cards
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                Allows players to seize an eligible opponent tile square for later placement.
              </span>
            </div>
          </label>

          {/* Checkbox 2: Swap */}
          <label
            onClick={() => handleToggleSetting('enableSwap')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              isHost ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
            } ${roomState.settings.enableSwap ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50'}`}
          >
            <input
              type="checkbox"
              checked={roomState.settings.enableSwap}
              disabled={!isHost}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Enable Swap cards (Negotiation)
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                Propose tile exchanges with counter-offers. Active turn locks until finished.
              </span>
            </div>
          </label>

          {/* Checkbox 3: Host-Approved Extra Turns */}
          <label
            onClick={() => handleToggleSetting('allowHostExtraTurns')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              isHost ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
            } ${roomState.settings.allowHostExtraTurns ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50'}`}
          >
            <input
              type="checkbox"
              checked={roomState.settings.allowHostExtraTurns}
              disabled={!isHost}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Allow host-approved extra turns
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                Host can grant an extra turn when justified. (No unanimous voting).
              </span>
            </div>
          </label>

          {/* Checkbox 4: Turn Timer */}
          <label
            onClick={() => handleToggleSetting('enableTurnTimer')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              isHost ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
            } ${roomState.settings.enableTurnTimer ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50'}`}
          >
            <input
              type="checkbox"
              checked={roomState.settings.enableTurnTimer}
              disabled={!isHost}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Enable turn timer (60s countdown)
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                Server-authoritative timer prevents stalling and passes turn on expiry.
              </span>
            </div>
          </label>

          {/* Checkbox 5: Detailed History */}
          <label
            onClick={() => handleToggleSetting('enableDetailedHistory')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors md:col-span-2 ${
              isHost ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
            } ${roomState.settings.enableDetailedHistory ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50'}`}
          >
            <input
              type="checkbox"
              checked={roomState.settings.enableDetailedHistory}
              disabled={!isHost}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Enable detailed move and negotiation history
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                Audits all placements, negotiations, and enables host-controlled state rollbacks.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            {activePlayers.length} of 4 players connected
          </span>
          <span className="text-[11px] text-slate-500">
            {activePlayers.length < 2
              ? 'Need at least 2 players to start game.'
              : 'All players must be ready before the host launches.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {yourPlayer && (
            <button
              onClick={() => onSetReady(!yourPlayer.isReady)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yourPlayer.isReady
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              {yourPlayer.isReady ? '✓ Ready (Click to Cancel)' : 'Mark Ready'}
            </button>
          )}

          {isHost && (
            <button
              onClick={onStartGame}
              disabled={activePlayers.length < 2}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-black text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Game</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
