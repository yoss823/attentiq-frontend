/**
 * V2AnalysisResult — matches the backend models/v2.py schema exactly.
 * Every analysis (video, text, image) returns this structure.
 */

export interface V2Diagnostic {
  label: string;       // e.g. "retention_high" | "retention_low" | "pacing_off" | ...
  score: number;       // 0.0–1.0
  explanation: string; // one human-readable sentence
}

export interface V2DashboardMetric {
  id: string;
  label: string;
  value: string;
  unit: string | null;  // "%" or null
  trend: 'up' | 'down' | 'neutral';
}

export interface V2Action {
  rank: 1 | 2 | 3;
  label: string;     // max 8 words
  rationale: string; // why this action matters
}

export interface V2Assistant {
  intents: string[];
  active: boolean;
}

export interface V2AnalysisResult {
  id: string;
  analysedAt: string;
  inputFormat: 'video' | 'image' | 'text';
  status: 'complete' | 'partial' | 'error';
  pipelineVersion: string;
  diagnostic: V2Diagnostic;
  dashboard: V2DashboardMetric[];
  actions: [V2Action, V2Action, V2Action];
  assistant: V2Assistant;
  sourceUrl?: string;
  sourcePlatform?: string;
  durationSeconds?: number;
}
