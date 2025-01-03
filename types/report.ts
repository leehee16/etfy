export interface Report {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  metadata: {
    createdAt: string;
    sessionCount: number;
    contexts: string[];
  };
}

export interface ReportContent {
  context_recognition?: string;
  summary: string | {
    overview: string;
    key_findings?: string[];
    activity_summary?: string[];
  };
  sections?: Array<{
    title: string;
    content: string;
    recommendations?: string[];
    risks?: string[];
    action_items?: string[];
    references?: string[];
  }>;
  conclusion?: string | {
    summary: string;
    next_steps?: string[];
    reminders?: string[];
  };
  disclaimer: string;
} 