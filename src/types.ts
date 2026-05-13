export type FoodCategory = 'proteins' | 'carbs' | 'fats' | 'vitamins';

export interface Enzyme {
  name: string;
  source: string;
  action: string;
}

export interface TransformationStep {
  from: string;
  to: string;
  enzymes: string[];
  description: string;
}

export interface Food {
  id: FoodCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
  transformations: {
    [key in DigestionStage]?: TransformationStep;
  };
}

export type DigestionStage = 'mouth' | 'stomach' | 'small_intestine' | 'absorption';

export interface StageInfo {
  id: DigestionStage;
  title: string;
  location: string;
  summary: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  time: number;
  createdAt: any;
}

export type AppSection = 'intro' | 'lab' | 'quiz' | 'leaderboard';
