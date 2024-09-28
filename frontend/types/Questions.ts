// Question Types

export interface QuestionProp {
  id: number;
  question: string;
  choices: Record<"1" | "2" | "3" | "4", string>;
  correctChoice: number;
}

export interface HistoricalQuestion {
  question: QuestionProp;
  selectedChoice: number;
  isCorrect: boolean;
}
