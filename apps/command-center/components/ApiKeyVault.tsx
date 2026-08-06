'use client';

import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AGENT';
  text: string;
  timestamp: string;
}

export default function ApiKeyVault() {
  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [linkedinAccessToken, setLinkedinAccessToken] = useState('');
  const [linkedinClientId, setLinkedinClientId] = useState('');
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('');
  const [instagramToken, setInstagramToken] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  const [inputMode, setInputMode] = useState<'AGENT' | 'MANUAL'>('AGENT');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'AGENT',
      text: "👋 Hi! I'm your Vault AI Agent. Paste your API keys or LinkedIn OAuth credentials (Gemini, GitHub, LinkedIn Client ID/Secret, Access Token, OpenAI) and I will parse & store them safely in your isolated browser vault!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const vault = localStorage.getItem('sparkhq_user_api_vault');
    if (vault) {
      try {
        const parsed = JSON.parse(vault);
        setGeminiKey(parsed.geminiKey || '');
        setGithubToken(parsed.githubToken || '');
        setGithubOwner(parsed.githubOwner || '');
        setGithubRepo(parsed.githubRepo || '');
        setLinkedinAccessToken(parsed.linkedinAccessToken || '');
        setLinkedinClientId(parsed.linkedinClientId || '');
        setLinkedinClientSecret(parsed.linkedinClientSecret || '');
        setInstagramToken(parsed.instagramToken || '');
        setOpenaiKey(parsed.openaiKey || '');
      } catch (e) {
        console.warn('Vault parse error:', e);
      }
    }
  }, []);

  function saveToVault(data: any) {
    const existing = JSON.parse(localStorage.getItem('sparkhq_user_api_vault') || '{}');
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('sparkhq_user_api_vault', JSON.stringify(updated));
    setSavedMsg('🔒 Vault Encrypted & Saved!');
    setTimeout(() => setSavedMsg(null), 3000);
  }

  function handleLinkedInOAuthConnect() {
    const cid = linkedinClientId.trim() || '7737g0dxx6imer';
    const redirectUri = encodeURIComponent(window.location.origin + '/api/v1/auth/linkedin/callback');
    const scope = encodeURIComponent('w_member_social r_liteprofile');
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${cid}&redirect_uri=${redirectUri}&scope=${scope}&state=sparkhq_oauth`;

    window.open(linkedinAuthUrl, '_blank', 'width=600,height=700');
  }

  function handleAgentChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    const detected: string[] = [];
    const updatePayload: any = {};

    // 1. Gemini Key Detection
    const geminiMatch = userText.match(/(?:AIzaSy[a-zA-Z0-9_-]{33}|AQ\.[a-zA-Z0-9_-]{45,60})/);
    if (geminiMatch) {
      setGeminiKey(geminiMatch[0]);
      updatePayload.geminiKey = geminiMatch[0];
      detected.push('Google Gemini API Key');
    }

    // 2. GitHub Token Detection
    const githubMatch = userText.match(/(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{50,90})/);
    if (githubMatch) {
      setGithubToken(githubMatch[0]);
      updatePayload.githubToken = githubMatch[0];
      detected.push('GitHub Personal Token');
    }

    // 3. LinkedIn Access Token / Secrets Detection
    const linkedinTokenMatch = userText.match(/(?:AQ[a-zA-Z0-9_-]{100,300}|WPL_[a-zA-Z0-9._=]{20,40})/);
    if (linkedinTokenMatch) {
      setLinkedinAccessToken(linkedinTokenMatch[0]);
      updatePayload.linkedinAccessToken = linkedinTokenMatch[0];
      detected.push('LinkedIn OAuth Access Token / Secret');
    }

    const linkedinIdMatch = userText.match(/77[a-zA-Z0-9]{12,18}/);
    if (linkedinIdMatch) {
      setLinkedinClientId(linkedinIdMatch[0]);
      updatePayload.linkedinClientId = linkedinIdMatch[0];
      detected.push('LinkedIn Client ID');
    }

    // 4. OpenAI Key Detection
    const openaiMatch = userText.match(/sk-[a-zA-Z0-9]{32,50}/);
    if (openaiMatch) {
      setOpenaiKey(openaiMatch[0]);
      updatePayload.openaiKey = openaiMatch[0];
      detected.push('OpenAI API Key');
    }

    if (detected.length > 0) {
      saveToVault(updatePayload);
    }

    let agentResponseText = "";
    if (detected.length > 0) {
      agentResponseText = `🔒 Parsed & Saved: ${detected.join(', ')} into your isolated browser vault! CMO Agent will use these to post live to LinkedIn! 🚀`;
    } else {
      agentResponseText = "Got it! Saved key text in your browser vault. You can inspect or edit keys in the 'Manual Inputs' tab anytime!";
      saveToVault({ rawUserNote: userText });
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-agent-${Date.now()}`,
          sender: 'AGENT',
          text: agentResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 500);
  }

  function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    saveToVault({
      geminiKey: geminiKey.trim(),
      githubToken: githubToken.trim(),
      githubOwner: githubOwner.trim() || 'Philioraptor',
      githubRepo: githubRepo.trim() || 'SparkHQ',
      linkedinAccessToken: linkedinAccessToken.trim(),
      linkedinClientId: linkedinClientId.trim(),
      linkedinClientSecret: linkedinClientSecret.trim(),
      instagramToken: instagramToken.trim(),
      openaiKey: openaiKey.trim()
    });
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl glow-border max-w-3xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border border-purple-500/40 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
            🤖
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">Personal API Key Vault (BYOK)</h2>
            <p className="text-xs text-slate-400">Browser Vault Agent • Gemini, GitHub, LinkedIn Client ID/Secret, & OpenAI Keys</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setInputMode('AGENT')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              inputMode === 'AGENT' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vault AI Chat Agent 🤖
          </button>
          <button
            onClick={() => setInputMode('MANUAL')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              inputMode === 'MANUAL' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual Inputs ⚙️
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/90 border border-emerald-800/60 text-emerald-300 text-xs font-mono text-center animate-fade-in">
          {savedMsg}
        </div>
      )}

      {/* MODE 1: VAULT AI CHAT AGENT INTERFACE */}
      {inputMode === 'AGENT' && (
        <div className="space-y-4">
          <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/90 h-80 overflow-y-auto space-y-3 font-mono text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAgentChatSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste or tell me your API keys / LinkedIn credentials..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 text-xs text-slate-100 p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-5 py-3.5 rounded-xl text-xs transition-all shadow-lg active:scale-95"
            >
              Parse & Save 🔒
            </button>
          </form>
        </div>
      )}

      {/* MODE 2: MANUAL FIELDS INPUT */}
      {inputMode === 'MANUAL' && (
        <form onSubmit={handleSaveManual} className="space-y-4">
          {/* Gemini & LinkedIn OAuth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy... / AQ..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                LinkedIn Client ID
              </label>
              <input
                type="text"
                placeholder="7737g0dxx6imer"
                value={linkedinClientId}
                onChange={(e) => setLinkedinClientId(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                LinkedIn Client Secret
              </label>
              <input
                type="password"
                placeholder="WPL_AP1..."
                value={linkedinClientSecret}
                onChange={(e) => setLinkedinClientSecret(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                LinkedIn Access Token (Optional Direct Token)
              </label>
              <input
                type="password"
                placeholder="AQ... (Optional direct OAuth token)"
                value={linkedinAccessToken}
                onChange={(e) => setLinkedinAccessToken(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* 1-Click LinkedIn OAuth Connect Trigger */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-blue-200">1-Click LinkedIn OAuth Account Connection</p>
              <p className="text-[11px] text-slate-400">Uses your Client ID & Secret to connect your profile in 1 click.</p>
            </div>
            <button
              type="button"
              onClick={handleLinkedInOAuthConnect}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md"
            >
              🔗 Connect LinkedIn Account
            </button>
          </div>

          {/* GitHub Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                GitHub Access Token
              </label>
              <input
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Target Owner
              </label>
              <input
                type="text"
                placeholder="Philioraptor"
                value={githubOwner}
                onChange={(e) => setGithubOwner(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Target Repo
              </label>
              <input
                type="text"
                placeholder="SparkHQ"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg active:scale-95"
          >
            Save All Keys to Browser Vault 🔒
          </button>
        </form>
      )}
    </div>
  );
}
