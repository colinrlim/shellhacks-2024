// @/types/Questions

// QuestionProp interface
export interface QuestionProp {
  _id: number;
  question: string;
  choices: Record<"1" | "2" | "3" | "4", string>;
  correctChoice: number;
  selectedChoice?: number;
  isCorrect?: boolean;
  explanation: string;
}

// HistoricalQuestion interface
export interface HistoricalQuestion {
  question: QuestionProp;
  selectedChoice: number;
  isCorrect: boolean;
}
