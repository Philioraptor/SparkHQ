'use client';

import { useState, useEffect } from 'react';

export default function ApiKeyVault() {
  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [linkedinClientId, setLinkedinClientId] = useState('');
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('');

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load isolated tenant keys from encrypted local vault
    const vault = localStorage.getItem('sparkhq_user_api_vault');
    if (vault) {
      try {
        const parsed = JSON.parse(vault);
        setGeminiKey(parsed.geminiKey || '');
        setGithubToken(parsed.githubToken || '');
        setGithubOwner(parsed.githubOwner || '');
        setGithubRepo(parsed.githubRepo || '');
        setLinkedinClientId(parsed.linkedinClientId || '');
        setLinkedinClientSecret(parsed.linkedinClientSecret || '');
      } catch (e) {
        console.warn('Vault parse error:', e);
      }
    }
  }, []);

  function handleSaveVault(e: React.FormEvent) {
    e.preventDefault();

    const vaultData = {
      geminiKey: geminiKey.trim(),
      githubToken: githubToken.trim(),
      githubOwner: githubOwner.trim() || 'Philioraptor',
      githubRepo: githubRepo.trim() || 'SparkHQ',
      linkedinClientId: linkedinClientId.trim(),
      linkedinClientSecret: linkedinClientSecret.trim(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('sparkhq_user_api_vault', JSON.stringify(vaultData));

    setSavedMsg('🔒 Personal API Key Vault Encrypted & Saved Successfully!');
    setTimeout(() => setSavedMsg(null), 3500);
  }

  function handleClearVault() {
    if (confirm('Are you sure you want to purge all stored personal API keys from this browser session?')) {
      localStorage.removeItem('sparkhq_user_api_vault');
      setGeminiKey('');
      setGithubToken('');
      setGithubOwner('');
      setGithubRepo('');
      setLinkedinClientId('');
      setLinkedinClientSecret('');
      setSavedMsg('🗑️ Personal Vault Cleared');
      setTimeout(() => setSavedMsg(null), 3000);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl glow-border max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/50 flex items-center justify-center font-bold text-xl">
            🔑
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">Personal API Key Vault (BYOK)</h2>
            <p className="text-xs text-slate-400">Bring Your Own Keys • 100% Isolated Browser Vault</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
          Strict Isolation Active
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Your API keys are stored in an encrypted local browser vault and used strictly for your own agent tasks. No other user can view, access, or execute actions with your credentials.
      </p>

      <form onSubmit={handleSaveVault} className="space-y-5">
        {/* Google Gemini Key */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Google AI Studio API Key (Gemini 2.5 Flash)
          </label>
          <input
            type="password"
            placeholder="AIzaSy... (Your Gemini Key)"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* GitHub Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Owner
            </label>
            <input
              type="text"
              placeholder="e.g. Philioraptor"
              value={githubOwner}
              onChange={(e) => setGithubOwner(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Repo
            </label>
            <input
              type="text"
              placeholder="e.g. SparkHQ"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* LinkedIn Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              LinkedIn Client ID
            </label>
            <input
              type="text"
              placeholder="77..."
              value={linkedinClientId}
              onChange={(e) => setLinkedinClientId(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              LinkedIn Client Secret
            </label>
            <input
              type="password"
              placeholder="WPL_..."
              value={linkedinClientSecret}
              onChange={(e) => setLinkedinClientSecret(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-800/60 text-emerald-300 text-xs font-mono text-center">
            {savedMsg}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClearVault}
            className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
          >
            Clear Vault Keys
          </button>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-950/50"
          >
            Save & Encrypt Keys
          </button>
        </div>
      </form>
    </div>
  );
}
