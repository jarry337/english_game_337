export interface Word {
  eng: string;
  kor: string;
  level: number;
}

export enum GameMode {
  ENG_TO_KOR = 'ENG_TO_KOR', // Show English, choose Korean
  KOR_TO_ENG = 'KOR_TO_ENG', // Show Korean, choose English
}

export enum Screen {
  START = 'START',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
}

export interface Question {
  target: Word;
  options: Word[]; // 4 options including the target
}

export interface GameState {
  screen: Screen;
  mode: GameMode;
  level: number;
  score: number;
  totalQuestions: number;
  hearts?: number; // For Challenge mode
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export const LEVEL_CHALLENGE = 99; // Special ID for challenge mode
