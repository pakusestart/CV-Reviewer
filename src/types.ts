export interface CVAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: {
    title: string;
    description: string;
    category: 'impact' | 'metrics' | 'keywords' | 'formatting';
  }[];
  improvements: {
    original: string;
    revised: string;
    reason: string;
  }[];
  atsMatch: {
    score: number;
    missingKeywords: string[];
    formattingIssues: string[];
  };
  hiringTips: string[];
  probabilities: {
    junior: number;
    senior: number;
    manager: number;
  };
  levelRecommendations: {
    junior: string;
    senior: string;
    manager: string;
  };
  recommendedJobs: string[];
  targetJob: string;
  language: 'id' | 'en';
  jobAlignment: {
    score: number;
    analysis: string;
  };
  extractedInfo: {
    name: string;
    contact: string;
    education: string[];
    experience: string[];
    skills: string[];
    summary: string;
  };
}
