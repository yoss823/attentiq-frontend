// types/v2.ts

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Format = 'video' | 'image' | 'text';
export type Intent = 'clarify' | 'explain' | 'expand' | 'rewrite-within-scope' | 'prioritize';

export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface Action {
  id: string;
  rank: 1 | 2 | 3;
  title: string;
  description: string;
  severity: Severity;
  effort: 'low' | 'medium' | 'high';
}

export interface DiagnosticResult {
  format: Format;
  score: number;           // 0–100
  headline: string;        // phrase principale du diagnostic
  summary: string;         // 2–3 phrases max
  metrics: Metric[];       // 3–5 métriques secondaires
  actions: [Action, Action, Action]; // exactement 3
  raw?: Record<string, unknown>;    // payload original backend
}
