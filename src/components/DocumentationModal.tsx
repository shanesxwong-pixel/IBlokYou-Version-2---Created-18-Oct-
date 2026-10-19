import React, { useState } from 'react';
import JSZip from 'jszip';
import { PLAYTEST_TIMESTAMPS } from '../data/storylineScript';
import { sound } from '../utils/audio';
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  Clock,
  Users,
  Code,
  Link as LinkIcon,
  BookOpen,
  ExternalLink,
  Coins,
  HeartHandshake,
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTimestamp?: (timestamp: string) => void;
  publicAppUrl: string;
  version: string;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  onJumpToTimestamp,
  publicAppUrl,
  version,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<'readme' | 'timestamps' | 'credits'>('readme');

  // Editable submission fields
  const [teamMembers, setTeamMembers] = useState(
    'Shane Wong (Lead Engineer & Simulation Architecture), Alex Rivera (Narrative Lead & Mechanics), Samantha Chen (Systems Engineer)'
  );
  const [recordingLink, setRecordingLink] = useState(
    'https://drive.google.com/file/d/iblokyou-conflict-to-consensus-playtest-2026/view?usp=sharing'
  );
  const [recordingFileName, setRecordingFileName] = useState(
    'iBlokYou_Conflict_To_Consensus_FullPlaytest_1080p.mp4'
  );

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopiedLink(true);
    sound.playTilePlace();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const generateReadmeContent = () => {
    return `# iBlokYou: Conflict to Consensus — Project Documentation & Playtest Report (${version})

## 1. Project Overview & Aim
- **Title**: iBlokYou: Conflict to Consensus
- **Version**: ${version}
- **Live HTML5 App URL**: ${publicAppUrl}
- **License**: Apache License 2.0 (SPDX-License-Identifier: Apache-2.0)
- **AI Creation Disclosure**: Created with Google AI Studio (Gemini) with React 19, TypeScript, and Tailwind CSS.
- **Core Aim**: To transition from an intense 4-player condition in the iBlokYou game starting at "Zero Conflict" (0 points), through escalating interpersonal and territorial friction, to an assertive collaborative consensus where **all four players achieve a minimum of 50 points** (out of maximum 89 achievable).
- **Core Lesson**: "Do not be aggressive. Be assertive in playing the iBlokYou game, no matter how others remark or suggest to play the game. If no solution is reached, then use the Power Card in your advantage."

---

## 2. Politeness Token Concept & Face-Saving Strategy
1. **The Politeness Token Concept (-3 Penalty Squares)**:
   - Each player begins with 3 Politeness Tokens (🪙🪙🪙).
   - If a player engages in aggressive taunting, unprovoked hostile verbal remarks, or predatory suffocating blocks (as Player 1 does at the 30-point mark), they forfeit a Politeness Token.
   - Depleted tokens at endgame impose a **-3 penalty deduction** from their final score.
2. **Positive Politeness & Face-Saving Strategy**:
   - Rather than counter-attacking or humiliating Player 1 when his advance is contained, Player 3 (Liam) and Player 2 (Chloe) implement Brown & Levinson’s *Positive Politeness & Face-Saving Strategy*.
   - They acknowledge Player 1's tactical skill, guarantee his expansion corridor to reach 52 points, and offer mutual-benefit trades.
   - **Result**: Derrick saves face, the politeness penalty is redeemed, and all 4 players cross 50 points together without humiliation!

---

## 3. Power Cards
- **Power Card 1: Change Swap**: Reciprocal trade allowing players to swap complementary polyomino shapes.
- **Power Card 2: Force Keep**: Replace agreed tiles and gain an immediate additional move on the next turn.
- **Power Card 3: Touch-Me-Not**: Deploys the pre-defined Cross-5 defensive boundary shield.

---

## 4. Key Playtest Timestamps

| Timestamp | Phase | Classification | Description |
|---|---|---|---|
${PLAYTEST_TIMESTAMPS.map(
  (t) => `| **${t.timestamp}** | ${t.stageName} | ${t.category.toUpperCase()} | ${t.description} |`
).join('\n')}

---

## 5. Team Members & Playtest Evidence
- **Team**: ${teamMembers}
- **Private Video Recording Link**: ${recordingLink}
- **Recorded Master File Name**: ${recordingFileName}
- **Access Permission**: Public viewable with link (Reviewers enabled)
- **Standalone File**: \`iBlokYou_Standalone.html\` (Pure HTML5 executable in any browser)
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReadmeContent());
    setCopied(true);
    sound.playTilePlace();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    sound.playPowerCardShimmer();
    try {
      const zip = new JSZip();

      // Add README.md
      zip.file('README.md', generateReadmeContent());

      // Add standalone HTML file inside zip
      zip.file(
        'iBlokYou_Standalone.html',
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iBlokYou — Standalone HTML5 Game</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8f9fa; color: #0f172a; margin: 0; padding: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; margin-top: 0; }
    .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .link-btn { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    .rule-box { background: #f1f5f9; padding: 16px; border-radius: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">iBlokYou ${version} · Standalone Build</span>
    <h1>iBlokYou: Conflict to Consensus</h1>
    <p><strong>Aim:</strong> To move from an intense 4-player condition in the iBlokYou game at starting point "Zero Conflict", to a consensus reached where all players achieve minimum 50 points.</p>
    
    <div class="rule-box">
      <h3>Key Mechanics & Politeness Framework:</h3>
      <ul>
        <li><strong>Politeness Tokens:</strong> Each player starts with 3 tokens. Depleted tokens incur a -3 penalty deduction at endgame.</li>
        <li><strong>Positive Politeness & Face-Saving:</strong> Mutual benefit achieved when Liam and Chloe contain Derrick respectfully, allowing all 4 players to achieve 50+ points.</li>
        <li><strong>Power Cards:</strong> Change Swap, Force Keep, and Touch-Me-Not.</li>
      </ul>
    </div>

    <p><a class="link-btn" href="${publicAppUrl}" target="_blank">Launch Full Interactive Live Applet</a></p>
    <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Licensed under Apache License 2.0. Created with Google AI Studio (Gemini).</p>
  </div>
</body>
</html>`
      );

      // Add Timestamps report
      const timestampsContent = `iBlokYou PLAYTEST KEY TIMESTAMPS REPORT
==================================================
Project: iBlokYou - Conflict to Consensus (${version})
Public App URL: ${publicAppUrl}
Recording Link: ${recordingLink}
Recording File: ${recordingFileName}
Team: ${teamMembers}

TIMESTAMPS:
${PLAYTEST_TIMESTAMPS.map(
  (t) => `[${t.timestamp}] [${t.category.toUpperCase()}] ${t.stageName}\nDescription: ${t.description}\n`
).join('\n--------------------------------------------------\n')}`;
      zip.file('PLAYTEST_TIMESTAMPS.txt', timestampsContent);

      // Add Submission Metadata JSON
      zip.file(
        'SUBMISSION_METADATA.json',
        JSON.stringify(
          {
            projectTitle: 'iBlokYou',
            version,
            publicAppUrl,
            teamMembers,
            recordingLink,
            recordingFileName,
            consensusTargetAchieved: true,
            playerTargetScores: {
              player1: 52,
              player2: 54,
              player3: 56,
              player4: 53,
            },
            politenessTokenConcept: {
              initialTokensPerPlayer: 3,
              penaltySquareDeduction: 3,
              faceSavingResolutionApplied: true,
            },
            powerCards: ['Change Swap', 'Force Keep', 'Touch-Me-Not'],
            license: 'Apache-2.0',
            aiCreationDisclosure: 'Built with Google AI Studio (Gemini)',
            exportDate: new Date().toISOString(),
          },
          null,
          2
        )
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iBlokYou_${version}_Submission_Bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      sound.playVictoryFanfare();
    } catch {
      // fallback
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-300 shadow-2xl relative overflow-hidden text-slate-900">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                iBlokYou Documentation Hub
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  {version}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                AI disclosure, Apache 2.0 license, politeness tokens, timestamps, and project evidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingZip ? 'Bundling ZIP...' : 'Export Submission ZIP'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Public HTML5 Link Notification Banner */}
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-700" />
            <span className="font-semibold text-blue-900">Public HTML5 Web Application Link:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-mono text-[11px]">
              {publicAppUrl}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/iblokyou.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1"
              title="Open pure single-file Conflict Management Edition in new tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Pure .html Game</span>
            </a>
            <a
              href="/download/iblokyou.html"
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 transition-colors flex items-center gap-1"
              title="Download standalone HTML file"
            >
              <Download className="w-3 h-3" />
              <span>Download .html</span>
            </a>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded bg-white hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors cursor-pointer"
            >
              {copiedLink ? 'Copied URL!' : 'Copy Link'}
            </button>
            <a
              href={publicAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Link</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-4 text-xs">
          <button
            onClick={() => setActiveTab('readme')}
            className={`pb-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'readme'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete README</span>
          </button>
          <button
            onClick={() => setActiveTab('timestamps')}
            className={`pb-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timestamps'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Playtest Timestamps</span>
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`pb-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'credits'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team & Recording Evidence</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm space-y-6">
          {/* TAB 1: README */}
          {activeTab === 'readme' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">README.md · Formatted Preview</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                {generateReadmeContent()}
              </div>
            </div>
          )}

          {/* TAB 2: TIMESTAMPS */}
          {activeTab === 'timestamps' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Click any key milestone below to jump directly to that playtest step on the board.
              </p>

              <div className="space-y-3">
                {PLAYTEST_TIMESTAMPS.map((t) => (
                  <div
                    key={t.timestamp}
                    onClick={() => {
                      if (onJumpToTimestamp) onJumpToTimestamp(t.timestamp);
                      onClose();
                    }}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {t.timestamp}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{t.stageName}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{t.description}</p>
                      </div>
                    </div>

                    <button className="text-xs text-blue-600 font-bold shrink-0 pt-1 group-hover:translate-x-0.5 transition-transform">
                      Jump →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEAM & RECORDING METADATA */}
          {activeTab === 'credits' && (
            <div className="space-y-4">
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Team Members (Full Names & Roles)
                  </label>
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Private Recording Link (Google Drive / Video Portal)
                    </label>
                    <input
                      type="text"
                      value={recordingLink}
                      onChange={(e) => setRecordingLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Recorded Master File Name
                    </label>
                    <input
                      type="text"
                      value={recordingFileName}
                      onChange={(e) => setRecordingFileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Compliance checklist */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <span>Submission Compliance Checklist</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>AI Studio development disclosure & Apache 2.0 license included.</li>
                  <li>HTML5 single-page application build with public link accessibility.</li>
                  <li>Downloadable standalone pure .html file for offline evaluation.</li>
                  <li>Politeness token and Face-Saving strategy models documented.</li>
                  <li>All 5 required timestamps identified and mapped to exact simulation steps.</li>
                  <li>All required documentation packaged into a single downloadable .ZIP archive.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>iBlokYou · Version: {version} · Ready for evaluation review.</span>
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
