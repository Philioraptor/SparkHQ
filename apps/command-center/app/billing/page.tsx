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
  const [customAmount, setCustomAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDonate(amountRs: number) {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const amountInPaise = amountRs * 100;

    try {
      // Create Razorpay Live Order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          planName: `Open Source Coffee Tip (₹${amountRs})`,
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
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: `Open Source Tip ₹${amountRs}`
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setSuccessMsg(`❤️ Thank you so much for supporting SparkHQ Open Source! Payment ID: ${response.razorpay_payment_id}`);
            } else {
              setSuccessMsg(`❤️ Thank you for your support! Payment ID: ${response.razorpay_payment_id}`);
            }
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
    <div className="min-h-screen bg-[#080B11] text-slate-100 pb-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Open Source Banner */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 mx-auto mb-4">
            ☕
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Buy Me a Coffee</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Project SparkHQ is 100% <strong>Free & Open Source</strong>! We build this for solo founders and developers worldwide. If SparkHQ saved you time, consider fueling further development!
          </p>
        </div>

        {successMsg && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-sm font-mono text-center shadow-xl animate-fade-in">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 p-4 rounded-xl bg-red-950/90 border border-red-800 text-red-300 text-sm font-mono text-center shadow-xl">
            {errorMsg}
          </div>
        )}

        {/* 1-Click Preset Coffee Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center flex flex-col justify-between hover:border-amber-500/50 transition-all">
            <div>
              <span className="text-3xl mb-2 block">☕</span>
              <h3 className="text-lg font-bold text-slate-100">Espresso Shot</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">A quick thank you coffee!</p>
              <div className="text-2xl font-black text-amber-400 mb-6">₹100</div>
            </div>
            <button
              onClick={() => handleDonate(100)}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-3 rounded-xl text-xs border border-amber-500/30 transition-all"
            >
              Support ₹100 ☕
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-amber-500/60 shadow-xl shadow-amber-950/30 text-center flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
              Most Popular
            </span>
            <div>
              <span className="text-3xl mb-2 block">☕☕</span>
              <h3 className="text-lg font-bold text-slate-100">Double Cappuccino</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Keep the agents coding late!</p>
              <div className="text-2xl font-black text-amber-400 mb-6">₹500</div>
            </div>
            <button
              onClick={() => handleDonate(500)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg shadow-amber-950/50 transition-all"
            >
              Support ₹500 ☕☕
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center flex flex-col justify-between hover:border-amber-500/50 transition-all">
            <div>
              <span className="text-3xl mb-2 block">🚀</span>
              <h3 className="text-lg font-bold text-slate-100">Open Source Sponsor</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Fuel major new feature updates!</p>
              <div className="text-2xl font-black text-amber-400 mb-6">₹2,500</div>
            </div>
            <button
              onClick={() => handleDonate(2500)}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-3 rounded-xl text-xs border border-amber-500/30 transition-all"
            >
              Sponsor ₹2,500 🚀
            </button>
          </div>
        </div>

        {/* Custom Donation Amount Box */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/90 max-w-lg mx-auto text-center mb-10">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
            Custom Coffee Support Amount
          </h3>
          <p className="text-xs text-slate-400 mb-4">Enter any custom amount in INR (₹)</p>

          <div className="flex gap-3 max-w-xs mx-auto mb-4">
            <span className="flex items-center text-sm font-mono font-bold text-slate-400">₹</span>
            <input
              type="number"
              min="50"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 bg-slate-950 text-sm text-slate-100 p-3 rounded-xl border border-slate-800 text-center font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => handleDonate(Number(customAmount) || 100)}
            disabled={loading}
            className="w-full max-w-xs mx-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-950/40"
          >
            Donate ₹{customAmount} ☕
          </button>
        </div>

        {/* GitHub Pull Request & Bug Contribution Box */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center max-w-2xl mx-auto">
          <h3 className="text-base font-bold text-slate-100 mb-1">Found a bug or want to contribute code?</h3>
          <p className="text-xs text-slate-400 mb-4">
            SparkHQ is open to the community! Submit pull requests, report issues, or suggest agent features directly on GitHub.
          </p>
          <a
            href="https://github.com/Philioraptor/SparkHQ"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-100 font-mono text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            <span>🐙 Open GitHub Repository (Philioraptor/SparkHQ) ↗</span>
          </a>
        </div>
      </main>
    </div>
  );
}
