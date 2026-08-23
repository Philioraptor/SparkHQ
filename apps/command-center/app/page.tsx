'use client';

import { useState } from 'react';
import Script from 'next/script';
import {
  ArrowRight,
  Braces,
  Check,
  FileCode2,
  Gauge,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { PLANS, PLAN_IDS, type PlanId } from '@/lib/plans';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRODUCT_NAME = 'Developer Prompt & Workflow Pack';

const features = [
  {
    icon: Braces,
    title: 'Opaque Errors, Solved',
    desc: 'Master Prompt that traces the real failure behind "Unknown Error" and "Execution stopped at this node" — one fix, exact field path.',
  },
  {
    icon: Gauge,
    title: 'Memory & Scale Limits',
    desc: 'Payload-audit prompt that finds what\'s eating RAM, plus queue-mode docker-compose for self-hosted n8n.',
  },
  {
    icon: Server,
    title: 'Self-Hosting Pain',
    desc: 'Vercel-exit audit covering the 3 silent contracts: immutable deploys, sharp/image config, Server Actions keys.',
  },
  {
    icon: RefreshCw,
    title: 'Upgrade & Dependency Drift',
    desc: 'Migration audit prompt — changelog diff, usage scan, CI-parity check. Bans the "just downgrade" answer.',
  },
  {
    icon: ShieldCheck,
    title: 'Vendor Lock-In, De-Risked',
    desc: '3-phase plan: coupling audit, abstraction layer, half-day exit drill. Optionality, not migration theater.',
  },
  {
    icon: FileCode2,
    title: 'Production Configs',
    desc: 'assetPrefix + BUILD_ID deploy fix, Server Actions key setup, image-optimizer loader, queue-mode Compose. Copy-paste, ship as-is.',
  },
];

const pricingPoints = [
  '5 Master Prompts — paste your error, get one actionable fix',
  'Root causes + why the standard fixes fail',
  'Production configs that deploy as-is',
  'Hard rules that ban generic advice',
  'Lifetime updates — free',
  '7-day refund, no questions',
];

export default function SellingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('prompt-pack');
  const [delivery, setDelivery] = useState<{ token: string; files: { file: string; label: string }[] } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plan = PLANS[selectedPlan];

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setDelivery(null);

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          currency: 'INR',
          customerEmail: email,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: plan.label,
        description: `₹${orderData.amount / 100} — one-time payment`,
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
                planId: selectedPlan,
                customerEmail: email,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.token) {
              setDelivery({ token: verifyData.token, files: verifyData.files || [] });
            } else {
              setSuccessMsg(
                `Payment received (ID: ${response.razorpay_payment_id}). Contact us if your download doesn't appear — we'll fix it fast.`
              );
            }
          } catch (err) {
            setSuccessMsg(
              `Payment received (ID: ${response.razorpay_payment_id}). Contact us if your download doesn't appear — we'll fix it fast.`
            );
          }
        },
        prefill: {
          email: email || undefined,
        },
        theme: {
          color: '#F59E0B',
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setErrorMsg(`Error starting checkout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-50 antialiased">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_55%)]" />

      <main className="relative mx-auto max-w-6xl px-6">
        {/* ============ HERO ============ */}
        <section className="flex flex-col items-center pb-20 pt-28 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-neutral-300">
            5 Master Prompts · n8n + Next.js · Built from 50+ real failure posts
          </span>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            You don&apos;t have an n8n problem.
            <br />
            <span className="text-neutral-500">You have a debugging problem.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400">
            &ldquo;Execution stopped at this node.&rdquo; ChunkLoadError on a Friday deploy.
            Build passes locally, CI fails. Each one is a 4-hour rabbit hole — this pack ends
            them with copy-paste prompts and configs that ship as-is.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Get the Pack Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#whats-inside"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 text-sm font-medium text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              See what&apos;s inside
            </a>
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            ₹299 · Both packs delivered · One-time · Instant delivery
          </p>
        </section>

        {/* ============ WHAT'S INSIDE ============ */}
        <section id="whats-inside" className="scroll-mt-24 pb-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What&apos;s inside
            </h2>
            <p className="mt-3 text-neutral-400">
              Five problems. One fix each. Fifteen minutes to install.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <feature.icon className="h-5 w-5 text-neutral-200" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ============ PRICING / CHECKOUT ============ */}
        <section id="pricing" className="scroll-mt-24 pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pick your pack</h2>
              <p className="mt-3 text-neutral-400">Pick either — every order delivers <span className="text-amber-300">both packs</span>. One-time. No subscription.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {PLAN_IDS.map((planId) => {
                const p = PLANS[planId];
                const active = selectedPlan === planId;
                return (
                  <button
                    key={planId}
                    type="button"
                    onClick={() => setSelectedPlan(planId)}
                    className={`relative rounded-2xl border p-6 text-left transition ${
                      active
                        ? 'border-white/40 bg-white/[0.06] shadow-[0_0_40px_rgba(255,255,255,0.05)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <h3 className="text-sm font-semibold tracking-tight">{p.shortLabel}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tracking-tight">₹{p.price / 100}</span>
                      <span className="text-sm text-neutral-500">+ both packs</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-400">{p.blurb}</p>
                    <span className={`mt-4 inline-flex items-center gap-1.5 text-xs font-medium ${active ? 'text-amber-300' : 'text-neutral-500'}`}>
                      <span className={`h-3.5 w-3.5 rounded-full border ${active ? 'border-amber-300' : 'border-neutral-600'}`}>
                        {active && <span className="block h-full w-full rounded-full bg-amber-300" />}
                      </span>
                      {active ? 'Selected' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_0_60px_rgba(255,255,255,0.04)]">
              <ul className="space-y-3">
                {pricingPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-100" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>

              <form onSubmit={handleBuy} className="mt-8 space-y-4">
                <input
                  type="email"
                  required
                  placeholder="you@email.com — for delivery"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-60"
                >
                  {loading ? 'Opening secure checkout...' : `Get ${plan.shortLabel} — ₹${plan.price / 100}`}
                  {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
              </form>

              {delivery && delivery.files.length > 0 && (
                <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-950/60 p-4 text-center">
                  <p className="text-xs text-emerald-300">Payment verified. Your files are ready.</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {delivery.files.map((d) => (
                      <a
                        key={d.file}
                        href={`/api/download?token=${delivery.token}&file=${encodeURIComponent(d.file)}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                      >
                        Download {d.label}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-emerald-400/80">
                    Keep this page — the links stay valid so you can re-download anytime.
                  </p>
                </div>
              )}

              {successMsg && (
                <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-950/60 p-3 text-xs text-emerald-300">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="mt-4 rounded-lg border border-red-800/60 bg-red-950/60 p-3 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <p className="mt-4 text-center text-xs text-neutral-500">
                If a pack doesn&apos;t save you time in the first week, get a full refund.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-neutral-500 sm:flex-row">
          <p>Built for developers who debug for a living.</p>
          <p>© 2026 · Developer Prompt &amp; Workflow Pack</p>
        </div>
      </footer>
    </div>
  );
}
