import React, { useState } from 'react';
import { PlayerId } from '../types/game';
import { PLAYERS } from '../data/storylineScript';
import { sound } from '../utils/audio';
import { X } from 'lucide-react';

interface RPSModalProps {
  isOpen: boolean;
  onFinish: (startingPlayerId: PlayerId) => void;
  onClose?: () => void;
}

type RPSChoice = 'rock' | 'paper' | 'scissors';

const RPS_EMOJIS: Record<RPSChoice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export const RPSModal: React.FC<RPSModalProps> = ({ isOpen, onFinish, onClose }) => {
  const [revealed, setRevealed] = useState(false);
  const [playerChoices, setPlayerChoices] = useState<Record<PlayerId, RPSChoice>>({
    player1: 'rock',
    player2: 'scissors',
    player3: 'scissors',
    player4: 'scissors',
  });
  const [winnerId, setWinnerId] = useState<PlayerId>('player1');

  if (!isOpen) return null;

  const handleRoll = () => {
    sound.playPowerCardShimmer();
    setPlayerChoices({
      player1: 'rock',
      player2: 'scissors',
      player3: 'scissors',
      player4: 'scissors',
    });
    setWinnerId('player1');
    setRevealed(true);
  };

  const handleSelectWinner = (id: PlayerId) => {
    setWinnerId(id);
  };

  const handleStartGame = () => {
    sound.playTilePlace();
    onFinish(winnerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-300 p-6 sm:p-7 shadow-2xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Stage 0: Turn Decider
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Scissors · Paper · Stone
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Draw Scissors · Paper · Stone to decide whose turn it is.
          </p>
        </div>

        {/* 4 Player Choices Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(PLAYERS) as PlayerId[]).map((pid) => {
            const player = PLAYERS[pid];
            const choice = playerChoices[pid];
            const isWinner = revealed && winnerId === pid;

            return (
              <div
                key={pid}
                onClick={() => revealed && handleSelectWinner(pid)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  isWinner
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60'
                } ${revealed ? 'cursor-pointer hover:border-slate-400' : ''}`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: player.colorHex }}
                  />
                  <span className="text-xs font-bold text-slate-900">{player.name}</span>
                </div>

                <div className="text-4xl my-2">
                  {revealed ? RPS_EMOJIS[choice] : '❓'}
                </div>

                <div className="text-xs font-mono text-slate-600 capitalize">
                  {revealed ? (
                    <span className={isWinner ? 'text-blue-700 font-bold' : ''}>
                      {choice} {isWinner ? '★ First Turn' : ''}
                    </span>
                  ) : (
                    'Ready'
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reaction */}
        {revealed && (
          <div className="mb-6 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 leading-relaxed">
            <span className="font-bold text-blue-700">Derrick (Rock):</span> "Ha! Rock crushes scissors. I'm going first. Starting at the top-left corner (0,0)."
          </div>
        )}

        {/* Large Black Button like reference image */}
        <div>
          {!revealed ? (
            <button
              onClick={handleRoll}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-black text-white shadow-md cursor-pointer transition-all active:scale-95"
            >
              Draw for next turn
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer transition-all active:scale-95"
            >
              Start Game with {PLAYERS[winnerId].name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
