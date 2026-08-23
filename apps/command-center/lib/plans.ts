// Server-enforced product catalog. Never trust the client for prices.
export type PlanId = 'combo' | 'prompt-pack' | 'n8n-pack';

export interface Plan {
  price: number; // in paise
  label: string;
  shortLabel: string;
  blurb: string;
  files: string[]; // bucket object names delivered with this plan
  fileLabels: Record<string, string>; // object name -> buyer-facing label
}

export const PLANS: Record<PlanId, Plan> = {
  'combo': {
    price: 49900, // ₹499
    label: 'Combo — Both Packs',
    shortLabel: 'Both Packs',
    blurb: 'Developer Prompt & Workflow Pack + n8n Workflow Pack. Everything, one price.',
    files: [
      'developer-prompt-workflow-pack.pdf',
      'n8n-workflow-pack.pdf',
      'n8n-workflow-templates.zip',
    ],
    fileLabels: {
      'developer-prompt-workflow-pack.pdf': 'Developer Prompt & Workflow Pack (PDF)',
      'n8n-workflow-pack.pdf': 'n8n Workflow Pack (PDF)',
      'n8n-workflow-templates.zip': 'n8n Workflow Templates (ZIP)',
    },
  },
  'prompt-pack': {
    price: 29900, // ₹299
    label: 'Developer Prompt & Workflow Pack',
    shortLabel: 'Prompt Pack',
    blurb: '5 master prompts for n8n/Next.js debugging + production configs.',
    files: ['developer-prompt-workflow-pack.pdf'],
    fileLabels: {
      'developer-prompt-workflow-pack.pdf': 'Developer Prompt & Workflow Pack (PDF)',
    },
  },
  'n8n-pack': {
    price: 29900, // ₹299
    label: 'n8n Workflow Pack',
    shortLabel: 'n8n Pack',
    blurb: '10 production-ready n8n workflows: import, configure, run.',
    files: ['n8n-workflow-pack.pdf', 'n8n-workflow-templates.zip'],
    fileLabels: {
      'n8n-workflow-pack.pdf': 'n8n Workflow Pack (PDF)',
      'n8n-workflow-templates.zip': 'n8n Workflow Templates (ZIP)',
    },
  },
};

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export function getPlan(planId: string | null | undefined): Plan | null {
  if (!planId) return null;
  return PLANS[planId as PlanId] ?? null;
}
