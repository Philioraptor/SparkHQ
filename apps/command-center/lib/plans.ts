// Server-enforced product catalog. Never trust the client for prices.
export type PlanId = 'prompt-pack' | 'n8n-pack';

export interface Plan {
  price: number; // in paise
  label: string;
  shortLabel: string;
  blurb: string;
  files: string[]; // bucket object names delivered with this plan
  fileLabels: Record<string, string>; // object name -> buyer-facing label
}

// Every purchase delivers BOTH packs (decision: keep listings separate,
// over-deliver on every order).
const ALL_FILES = [
  'developer-prompt-workflow-pack.pdf',
  'n8n-workflow-pack.pdf',
  'n8n-workflow-templates.zip',
];

const FILE_LABELS: Record<string, string> = {
  'developer-prompt-workflow-pack.pdf': 'Developer Prompt & Workflow Pack (PDF)',
  'n8n-workflow-pack.pdf': 'n8n Workflow Pack (PDF)',
  'n8n-workflow-templates.zip': 'n8n Workflow Templates (ZIP)',
};

export const PLANS: Record<PlanId, Plan> = {
  'prompt-pack': {
    price: 29900, // ₹299
    label: 'Developer Prompt & Workflow Pack',
    shortLabel: 'Prompt Pack',
    blurb: '5 master prompts for n8n/Next.js debugging + production configs.',
    files: ALL_FILES,
    fileLabels: FILE_LABELS,
  },
  'n8n-pack': {
    price: 29900, // ₹299
    label: 'n8n Workflow Pack',
    shortLabel: 'n8n Pack',
    blurb: '10 production-ready n8n workflows: import, configure, run.',
    files: ALL_FILES,
    fileLabels: FILE_LABELS,
  },
};

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export function getPlan(planId: string | null | undefined): Plan | null {
  if (!planId) return null;
  return PLANS[planId as PlanId] ?? null;
}
