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
}

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<string | null>('Pro Founder');

  const plans: PlanTier[] = [
    {
      id: 'starter',
      name: 'Starter Solopreneur Plan',
      priceDisplay: '₹3,999 / mo',
      amountPaise: 399900,
      description: 'Perfect for solo developers building their first product.',
      features: [
        '1 GitHub Repository Integration',
        'CTO Agent PR Generator (10 PRs/mo)',
        'AI Customer Support Chatbot Widget',
        'BYOK Personal API Vault'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Founder Plan',
      priceDisplay: '₹11,999 / mo',
      amountPaise: 1199900,
      description: 'Full autonomous C-Suite for scaling founders.',
      recommended: true,
      features: [
        'Multi-Repo Central Router',
        'CTO Code + CMO LinkedIn Worker Engines',
        'LinkedIn Feed Auto-Publishing API',
        'Self-Healing Bug Fix Loop',
        '9:00 AM IST CEO Executive Standup Cron',
        '1-Click Exterminate & Approval Controls'
      ]
    },
    {
      id: 'agency',
      name: 'Venture Studio / Agency',
      priceDisplay: '₹39,999 / mo',
      amountPaise: 3999900,
      description: 'For accelerators and multi-product venture studios.',
      features: [
        'Unlimited GitHub Repositories',
        'White-Label AI C-Suite Dashboard',
        '10 Portfolio Founder Seats',
        'Priority Self-Healing Support',
        'Custom Webhooks & Database Event Logs'
      ]
    }
  ];

  async function handleRazorpayCheckout(plan: PlanTier, isTestTransaction: boolean = false) {
    setLoadingPlan(plan.id);
    setPaymentSuccessMsg(null);
    setPaymentErrorMsg(null);

    const targetAmount = isTestTransaction ? 100 : plan.amountPaise; // 100 paise = ₹1 test

    try {
      // Step 1: Create Order on Backend (POST /api/create-order)
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: targetAmount,
          planName: plan.name,
          currency: 'INR'
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay Order');
      }

      // Step 2: Open Razorpay Checkout Modal
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TMATwCtXP1qs4O',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SparkHQ AI C-Suite',
        description: `Subscription: ${plan.name}`,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616490.png',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          console.log('[Razorpay Handler Received Response]', response);

          // Step 3: Verify Payment Signature on Backend (POST /api/verify-payment)
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
              setPaymentSuccessMsg(`🎉 Payment Verified! Subscribed to ${plan.name}. Payment ID: ${response.razorpay_payment_id}`);
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
            console.log('[Razorpay Modal Dismissed by User]');
            setLoadingPlan(null);
          }
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error('[Razorpay Payment Failed]', response.error);
          setPaymentErrorMsg(`❌ Payment Failed: ${response.error.description || 'Transaction declined'}`);
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK script not loaded yet. Please refresh page.');
      }
    } catch (err: any) {
      console.error('[Checkout Error]', err);
      setPaymentErrorMsg(`❌ Error: ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 pb-16">
      {/* Razorpay Standard Web Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Self-Service Subscriptions & Paywall</h1>
            <p className="text-xs text-slate-400 mt-1">Razorpay Standard Web Checkout Gateway • Real-time Signature Verification</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Plan: {activeSubscription}
          </span>
        </div>

        {/* Payment Success / Error Notifications */}
        {paymentSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-sm font-mono flex items-center justify-between">
            <span>{paymentSuccessMsg}</span>
            <button onClick={() => setPaymentSuccessMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {paymentErrorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/90 border border-red-800 text-red-300 text-sm font-mono flex items-center justify-between">
            <span>{paymentErrorMsg}</span>
            <button onClick={() => setPaymentErrorMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Razorpay Credentials Info Banner */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl mb-8 glow-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">💳</span>
                <h3 className="text-base font-bold text-slate-100">Razorpay Standard Web Checkout Integration</h3>
              </div>
              <p className="text-xs text-slate-400">
                Key ID: <code className="text-blue-400 font-mono">rzp_test_TMATwCtXP1qs4O</code> • HMAC-SHA256 Server Signature Verification
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRazorpayCheckout(plans[1], true)}
                className="bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-purple-800/60 transition-all"
              >
                🧪 Run ₹1 Test Transaction
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                plan.recommended
                  ? 'border-blue-500/60 shadow-2xl shadow-blue-950/30 relative'
                  : 'border-slate-800/80'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-6 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                <div className="my-4">
                  <span className="text-3xl font-black text-slate-100 tracking-tight">{plan.priceDisplay}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleRazorpayCheckout(plan, false)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full font-bold py-3 rounded-xl text-xs transition-all shadow-lg active:scale-95 ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-950/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {loadingPlan === plan.id ? 'Initializing Order...' : `Subscribe via Razorpay (${plan.priceDisplay})`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Card & Test UPI Info Box */}
        <div className="glass-card rounded-xl p-5 border border-slate-800/90 text-xs font-mono text-slate-400">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">🧪 Test Transaction Credentials</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Test Card:</span>
              <code>4111 1111 1111 1111</code> • CVV: <code>123</code> • Exp: <code>12/26</code>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Test UPI:</span>
              <code>test@razorpay</code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
