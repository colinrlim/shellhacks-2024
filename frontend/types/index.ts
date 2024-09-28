// @/types
import { QuestionProp, HistoricalQuestion } from "./Questions";

interface PromptProps {
  role: string;
  content: string;
}

export type { QuestionProp as Question, HistoricalQuestion, PromptProps };
