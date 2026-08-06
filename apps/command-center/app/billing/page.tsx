'use client';

import { useState } from 'react';
import Script from 'next/script';
import Header from '../../components/Header';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanTier {
  id: string;
  name: string;
  priceDisplay: string;
  amountPaise: number;
  description: string;
  features: string[];
  recommended?: boolean;
  isFree?: boolean;
  isCustom?: boolean;
}

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<string | null>('Free BYOK Tier');

  const plans: PlanTier[] = [
    {
      id: 'free-byok',
      name: 'Free BYOK Tier',
      priceDisplay: '₹0 / Forever Free',
      amountPaise: 0,
      isFree: true,
      description: 'Bring your own API keys. Free forever with zero server markups.',
      features: [
        '100% Free Forever Access',
        'Bring Your Own Keys (BYOK API Vault)',
        'CTO Agent PR Generator',
        'CMO B2B LinkedIn Post Generator',
        'AI Helpdesk Customer Support Chatbot',
        '1-Click Exterminate & Approval Inbox'
      ]
    },
    {
      id: 'starter',
      name: 'Starter Solopreneur',
      priceDisplay: '₹1,999 / mo',
      amountPaise: 199900,
      recommended: true,
      description: 'Full autonomous C-Suite using your own API keys.',
      features: [
        'Exact ₹1,999/mo Solopreneur Rate',
        'CTO Code + CMO LinkedIn Worker Engines',
        'LinkedIn Feed Auto-Publishing API',
        'Self-Healing Bug Fix Loop',
        '9:00 AM IST CEO Executive Standup Cron',
        '1-Click Exterminate & Approval Controls'
      ]
    },
    {
      id: 'enterprise',
      name: 'Venture Studio / Agency',
      priceDisplay: 'Contact Developer',
      amountPaise: 0,
      isCustom: true,
      description: 'For accelerators and multi-product venture studios.',
      features: [
        'Custom Multi-Agent Deployments',
        'Unlimited Repositories & Workspaces',
        'White-Label AI C-Suite Dashboard',
        'Custom Dedicated API Vault Setup',
        'Direct Developer Contact & Support'
      ]
    }
  ];

  async function handleActivatePlan(plan: PlanTier) {
    setLoadingPlan(plan.id);
    setPaymentSuccessMsg(null);
    setPaymentErrorMsg(null);

    if (plan.isFree) {
      setActiveSubscription(plan.name);
      setPaymentSuccessMsg(`🎉 Free BYOK Tier Activated! Manage your personal API keys in the Vault tab.`);
      setLoadingPlan(null);
      return;
    }

    if (plan.isCustom) {
      window.location.href = 'mailto:founder@sparkhq.ai?subject=SparkHQ%20Enterprise%20Custom%20Quote%20Request';
      setLoadingPlan(null);
      return;
    }

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.amountPaise,
          planName: plan.name,
          currency: 'INR'
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay Live Order');
      }

      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TMBqGRFBGmtaMH',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SparkHQ AI C-Suite',
        description: `Subscription: ${plan.name}`,
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
                planName: plan.name
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setActiveSubscription(plan.name);
              setPaymentSuccessMsg(`🎉 Live Payment Verified! Subscribed to ${plan.name}. Payment ID: ${response.razorpay_payment_id}`);
            } else {
              setPaymentErrorMsg(`❌ Verification Failed: ${verifyData.error || 'Signature Mismatch'}`);
            }
          } catch (verifyErr: any) {
            setPaymentErrorMsg(`❌ Verification Error: ${verifyErr.message}`);
          }
        },
        prefill: {
          name: 'Dhruv Mishra',
          email: 'founder@sparkhq.ai',
          contact: '9876543210'
        },
        notes: {
          planId: plan.id,
          planName: plan.name
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          }
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setPaymentErrorMsg(`❌ Payment Failed: ${response.error.description || 'Transaction declined'}`);
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK script not loaded yet. Please refresh page.');
      }
    } catch (err: any) {
      setPaymentErrorMsg(`❌ Error: ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 pb-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Self-Service Subscriptions & BYOK Tiers</h1>
            <p className="text-xs text-slate-400 mt-1">Razorpay Live Production Gateway • Real-time Signature Verification</p>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Plan: {activeSubscription}
          </span>
        </div>

        {paymentSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-sm font-mono flex items-center justify-between shadow-xl animate-fade-in">
            <span>{paymentSuccessMsg}</span>
            <button onClick={() => setPaymentSuccessMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {paymentErrorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/90 border border-red-800 text-red-300 text-sm font-mono flex items-center justify-between shadow-xl">
            <span>{paymentErrorMsg}</span>
            <button onClick={() => setPaymentErrorMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Live Gateway Highlight Banner */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-800/80 shadow-2xl mb-8 glow-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚡</span>
                <h3 className="text-base font-bold text-slate-100">BYOK Solo Founder Pricing</h3>
              </div>
              <p className="text-xs text-slate-400">
                Solopreneur Rate: <code className="text-emerald-400 font-bold font-mono">₹1,999 / mo</code> • Users bring their own API keys for zero markups!
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleActivatePlan(plans[0])}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-xl shadow-emerald-950/60 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>⚡ Select Free BYOK Tier (₹0)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                plan.isFree
                  ? 'border-emerald-500/60 shadow-xl shadow-emerald-950/20'
                  : plan.recommended
                  ? 'border-blue-500/60 shadow-2xl shadow-blue-950/30 relative'
                  : 'border-slate-800/80'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-6 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                  Most Popular
                </span>
              )}

              {plan.isFree && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 w-max mb-2">
                  Forever Free
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-100">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>
                <div className="my-4">
                  <span className="text-3xl font-black text-slate-100 tracking-tight">{plan.priceDisplay}</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className={plan.isFree ? "text-emerald-400 font-bold" : "text-blue-400 font-bold"}>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleActivatePlan(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full font-extrabold py-3.5 rounded-xl text-xs transition-all shadow-lg active:scale-95 ${
                    plan.isFree
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                      : plan.recommended
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-950/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {plan.isFree
                    ? '⚡ Select Free BYOK Tier (₹0)'
                    : plan.isCustom
                    ? '📧 Contact Developer'
                    : `Subscribe via Razorpay (${plan.priceDisplay})`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
