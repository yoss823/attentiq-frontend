export interface DiagnosticMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface DiagnosticAction {
  id: string;
  rank: 1 | 2 | 3;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface DiagnosticResult {
  format: 'video' | 'image' | 'text';
  score: number;
  headline: string;
  summary: string;
  metrics: DiagnosticMetric[];
  actions: [DiagnosticAction, DiagnosticAction, DiagnosticAction];
  raw?: Record<string, unknown>;
}
