export interface V2Diagnostic {
  label: string;
  score: number;
  explanation: string;
}

export interface V2DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string | null;
  trend: 'up' | 'down' | 'neutral';
}

export interface V2Action {
  rank: number;
  label: string;
  rationale: string;
}

export interface V2AssistantIntent {
  type: string;
  available: boolean;
  description: string;
}

export interface V2Assistant {
  intents: V2AssistantIntent[];
  active: boolean;
}

export interface V2AnalysisResult {
  id: string;
  analysedAt: string;
  inputFormat: 'video' | 'text' | 'image';
  status: string;
  pipelineVersion: string;
  diagnostic: V2Diagnostic;
  dashboard: V2DashboardMetric[];
  actions: V2Action[];
  assistant: V2Assistant;
  sourceUrl?: string | null;
  sourcePlatform?: string | null;
  durationSeconds?: number | null;
}
