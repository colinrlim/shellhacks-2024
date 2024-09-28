// components/Question.tsx

import React from "react";
import { Question as QuestionType } from "@/types";

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
}

function Question({ question, questionNumber }: QuestionProps) {
  const choices = Object.entries(question.choices).filter(
    ([key]) => !isNaN(Number(key))
  );

  return (
    <div className="mb-6">
      <p className="mb-2">
        Question #{questionNumber}: {question.question}
      </p>
      <div className="space-y-2">
        {choices.map(([key, value]) => (
          <button
            key={key}
            className="w-full px-4 py-2 text-left bg-gray-100 border rounded"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Question;
