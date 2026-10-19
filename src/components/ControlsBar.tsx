import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  Zap,
  FastForward,
  Bot,
  Hand,
} from 'lucide-react';

interface ControlsBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPowerCards: () => void;
  onOpenDocs: () => void;
  onJumpStage: (stepIdx: number) => void;
  playMode: 'auto' | 'manual';
  onTogglePlayMode: (mode: 'auto' | 'manual') => void;
  stageNumber: number; // 0, 1, 2, 3
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  currentStep,
  totalSteps,
  playbackSpeed,
  onChangeSpeed,
  soundEnabled,
  onToggleSound,
  onOpenPowerCards,
  onOpenDocs,
  onJumpStage,
  playMode,
  onTogglePlayMode,
  stageNumber,
}) => {
  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
      {/* Top Row: Mode Switch & Stage Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        {/* Play Mode Toggle (Large & Prominent) */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-300">
          <button
            onClick={() => onTogglePlayMode('auto')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              playMode === 'auto'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Auto Storyline Simulation</span>
          </button>
          <button
            onClick={() => onTogglePlayMode('manual')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              playMode === 'manual'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Hand className="w-4 h-4 text-emerald-400" />
            <span>Interactive Manual Play</span>
          </button>
        </div>

        {/* Stage Status Display */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block font-bold">
              STAGE
            </span>
            <span className="text-lg font-black font-mono text-slate-900">
              {stageNumber} / 3
            </span>
          </div>

          <button
            onClick={onReset}
            title="Reset Game to Starting State"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Transport Controls (Extra Prominent Buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Previous Step Button */}
          <button
            onClick={onPrevStep}
            disabled={currentStep <= 0}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-slate-300 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <SkipBack className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Primary Action Button (Extra Large & Bold) */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm sm:text-base font-black shadow-lg transition-all active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-2 border-amber-600'
                : 'bg-slate-900 hover:bg-black text-white border-2 border-slate-900'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isPlaying ? 'Pause Simulation' : 'Play Scenario'}</span>
          </button>

          {/* Next Step Button */}
          <button
            onClick={onNextStep}
            disabled={currentStep >= totalSteps - 1}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-slate-300 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Next Move</span>
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-100 border-2 border-slate-200 rounded-xl p-1 text-xs font-mono ml-1">
            <FastForward className="w-4 h-4 text-slate-500 ml-1.5" />
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Stage Jumps & Auxiliary Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenPowerCards}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 border-2 border-purple-300 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Zap className="w-4 h-4 text-purple-700" />
            <span>Power Cards</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 border-2 border-blue-300 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Docs Hub</span>
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
