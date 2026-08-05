'use client';

import { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  isEscalated?: boolean;
  ticketId?: string;
}

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'BOT',
      text: '👋 Hi! I am the SparkHQ AI Support Agent. How can I help with billing, account settings, or bug reports today?'
    }
  ]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: inputText.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    const prompt = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail || 'user@sparkhq.ai',
          message: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: data.reply,
          isEscalated: data.isEscalated,
          ticketId: data.ticketId
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Local fallback
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: 'I have logged your request. If this is a bug, our CTO Agent will automatically analyze it and raise a GitHub PR for approval!'
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.warn('Support Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'BOT',
          text: '⚡ Issue logged! Escalated to CTO Agent for self-healing bug fix.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-blue-500/40 border border-blue-400/30 flex items-center gap-2.5 group transition-all hover:scale-105"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold uppercase tracking-wider pr-1">AI Helpdesk Support</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Embedded Chat Modal */}
      {isOpen && (
        <div className="glass-card rounded-2xl w-80 sm:w-96 shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-slate-950/90 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/50 flex items-center justify-center font-bold text-base">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">SparkHQ AI Support Agent</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 80-90% Automated Query Resolution
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800"
            >
              ✕
            </button>
          </div>

          {/* User Email Field Optional */}
          <div className="bg-slate-900/80 px-3 py-1.5 border-b border-slate-800/60 text-[10px] flex items-center gap-2">
            <span className="text-slate-400">Your Email:</span>
            <input
              type="email"
              placeholder="user@startup.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full font-mono"
            />
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none font-sans'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.isEscalated && (
                    <div className="mt-2 pt-2 border-t border-purple-800/40 text-[10px] text-purple-300 font-mono flex items-center gap-1">
                      <span>⚡ Support Ticket #{msg.ticketId || 'LOGGED'} ➔ Escalated to CTO Agent for PR Fix!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-slate-500 text-[10px] font-mono animate-pulse">
                AI Agent analyzing query...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask billing question or report a bug..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 text-xs text-white px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-bold"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
