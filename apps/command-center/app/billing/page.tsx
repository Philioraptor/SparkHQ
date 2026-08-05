'use client';

import { useState } from 'react';
import Header from '../../components/Header';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  async function handleOpenPortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Stripe Customer Portal Demo: Redirecting to Stripe self-service billing management...');
      }
    } catch (e) {
      alert('Stripe Customer Portal Demo: Redirecting to Stripe self-service portal...');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 pb-16">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Self-Service Billing & Subscriptions</h1>
            <p className="text-xs text-slate-400 mt-1">Manage plans, update payment methods, and download invoices without manual support.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            Current Plan: Pro Founder ($149/mo)
          </span>
        </div>

        {/* Self-Service Portal Card */}
        <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl mb-8 glow-border">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💳</span>
                <h3 className="text-lg font-bold text-slate-100">Stripe Customer Self-Service Portal</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                1-Click self-service management powered by Stripe & Clerk. Upgrade, downgrade, update credit cards, or cancel subscriptions instantly with zero founder intervention required.
              </p>
            </div>

            <button
              onClick={handleOpenPortal}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-950/50 active:scale-95"
            >
              {loading ? 'Opening Portal...' : 'Launch Stripe Customer Portal ↗'}
            </button>
          </div>
        </div>

        {/* Available Subscription Tiers */}
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Subscription Plan Tiers</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-200">Starter Solopreneur</h4>
              <p className="text-2xl font-extrabold text-blue-400 mt-2">$49 <span className="text-xs font-normal text-slate-400">/ mo</span></p>
              <ul className="text-xs text-slate-400 space-y-2 mt-4">
                <li>• 1 GitHub Repository</li>
                <li>• CTO PR Generator (10/mo)</li>
                <li>• AI Customer Support Chatbot</li>
              </ul>
            </div>
            <button onClick={handleOpenPortal} className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-lg text-xs">
              Select Starter
            </button>
          </div>

          <div className="glass-card rounded-xl p-6 border border-blue-500/50 relative flex flex-col justify-between shadow-xl">
            <span className="absolute -top-3 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-600 text-white">
              Most Popular
            </span>
            <div>
              <h4 className="text-base font-bold text-slate-100">Pro Founder</h4>
              <p className="text-2xl font-extrabold text-blue-400 mt-2">$149 <span className="text-xs font-normal text-slate-400">/ mo</span></p>
              <ul className="text-xs text-slate-300 space-y-2 mt-4">
                <li>• Multi-Repo Central Router</li>
                <li>• CTO + CMO Agent Engines</li>
                <li>• LinkedIn Auto-Publishing</li>
                <li>• Self-Healing Bug Fix Loop</li>
                <li>• CEO 9AM Daily Standup Cron</li>
              </ul>
            </div>
            <button onClick={handleOpenPortal} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-xs">
              Current Active Plan
            </button>
          </div>

          <div className="glass-card rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-200">Venture Studio / Agency</h4>
              <p className="text-2xl font-extrabold text-purple-400 mt-2">$499 <span className="text-xs font-normal text-slate-400">/ mo</span></p>
              <ul className="text-xs text-slate-400 space-y-2 mt-4">
                <li>• Unlimited Repositories</li>
                <li>• White-label AI C-Suite</li>
                <li>• 10 Portfolio Startup Seats</li>
                <li>• Priority Self-Healing Support</li>
              </ul>
            </div>
            <button onClick={handleOpenPortal} className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-lg text-xs">
              Upgrade to Agency
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
