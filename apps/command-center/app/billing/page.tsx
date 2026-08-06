'use client';

import { useState } from 'react';
import Script from 'next/script';
import Header from '../../components/Header';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CoffeeSupportPage() {
  const [customAmount, setCustomAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDonate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const amountRs = Number(customAmount);
    if (!amountRs || amountRs < 1) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const amountInPaise = amountRs * 100;

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          planName: `Open Source Coffee Support (₹${amountRs})`,
          currency: 'INR'
        })
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TMBqGRFBGmtaMH',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SparkHQ Open Source',
        description: `Coffee Tip: ₹${amountRs}`,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616490.png',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: `Coffee Support ₹${amountRs}`
              })
            });
            setSuccessMsg(`❤️ Thank you so much for supporting SparkHQ Open Source! Payment ID: ${response.razorpay_payment_id}`);
          } catch (e) {
            setSuccessMsg(`❤️ Thank you for supporting Open Source! Payment ID: ${response.razorpay_payment_id}`);
          }
        },
        prefill: {
          name: 'Dhruv Mishra',
          email: 'founder@sparkhq.ai'
        },
        theme: {
          color: '#F59E0B'
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setErrorMsg(`Error initializing donation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 pb-16 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Minimal Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 mx-auto mb-4">
            ☕
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Buy Me a Coffee</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Project SparkHQ is 100% <strong>Free & Open Source</strong>! Enter any amount to support development.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-mono text-center shadow-xl animate-fade-in">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/90 border border-red-800 text-red-300 text-xs font-mono text-center shadow-xl">
            {errorMsg}
          </div>
        )}

        {/* Minimal Custom Coffee Card */}
        <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl glow-border text-center mb-8">
          <form onSubmit={handleDonate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enter Custom Coffee Support Amount (INR ₹)
              </label>
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <span className="text-xl font-bold font-mono text-amber-400">₹</span>
                <input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-950 text-xl font-extrabold text-slate-100 p-4 rounded-xl border border-slate-800 text-center font-mono focus:outline-none focus:border-amber-500 shadow-inner"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !customAmount}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-950/50 active:scale-95"
            >
              {loading ? 'Opening Gateway...' : `Buy Me a Coffee (₹${customAmount || 0}) ☕`}
            </button>
          </form>
        </div>

        {/* GitHub Pull Request & Bug Contribution Link */}
        <div className="text-center pt-4">
          <a
            href="https://github.com/Philioraptor/SparkHQ"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-slate-400 hover:text-white underline transition-colors"
          >
            🐙 Open GitHub Repository (Philioraptor/SparkHQ) ↗
          </a>
        </div>
      </main>
    </div>
  );
}
