// @/types
import { QuestionProp, HistoricalQuestion } from "./Questions";
import { Relationship, Topic } from "./Topics";

interface PromptProps {
  role: string;
  content: string;
}

export type {
  QuestionProp as Question,
  HistoricalQuestion,
  PromptProps,
  Relationship,
  Topic,
};
