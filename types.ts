export enum GameState {
  START,
  LOADING,
  PLAYING,
  SHOW_RESULT,
  GAME_OVER,
  ERROR,
}

export interface SentenceData {
  sentence: string;
  isCorrect: boolean;
}

export interface GameData {
  image: string;
  sentences: SentenceData[];
}
