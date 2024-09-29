// components/Question.tsx

import React from "react";
import { Question as QuestionType } from "@/types";
import { answerQuestion } from "@/store/slices/questionsSlice";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import Loader from "./Loader"; // Import the Spinner component

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
}

function Question({ question, questionNumber, currentTopic }: QuestionProps) {
  const dispatch = useAppDispatch();
  const choices = Object.entries(question.choices).filter(
    ([key]) => !isNaN(Number(key))
  );

  const handleAnswerQuestion = (selectedChoice: 1 | 2 | 3 | 4) => {
    if (question.selectedChoice) return;

    // Dispatch the event to the store
    dispatch(
      answerQuestion({
        questionId: question._id,
        selectedChoice,
        currentTopic,
      })
    );
  };

  const loading = useAppSelector(
    (state) => state.questions.loading[question._id]
  );

  return (
    <div className="mb-6 relative">
      {" "}
      {/* Make the container relative for absolute positioning */}
      <p className="mb-2">
        Question #{questionNumber}: {question.question}
      </p>
      <div className="space-y-2 relative">
        {" "}
        {/* Position relative to contain the absolute spinner */}
        {choices.map(([key, value]) => {
          const choiceKey = parseInt(key) as 1 | 2 | 3 | 4;
          let buttonClass =
            "w-full px-4 py-2 text-left border rounded cursor-pointer";

          if (question.selectedChoice) {
            if (choiceKey === question.correctChoice) {
              buttonClass += " bg-green-100 border-green-500";
            } else if (choiceKey === question.selectedChoice) {
              buttonClass += " bg-red-100 border-red-500";
            } else {
              buttonClass += " bg-gray-100";
            }
          } else {
            buttonClass += ` bg-gray-100 ${loading ? "" : "hover:bg-gray-200"}`;
          }

          return (
            <button
              key={key}
              className={buttonClass}
              onClick={() => handleAnswerQuestion(choiceKey)}
              disabled={!!question.selectedChoice || loading}
            >
              {value}
            </button>
          );
        })}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded">
            <Loader show={loading} />
          </div>
        )}
      </div>
      {question.selectedChoice && (
        <p
          className={`mt-2 ${
            question.isCorrect ? "text-green-500" : "text-red-500"
          }`}
        >
          {question.isCorrect
            ? "Correct!"
            : `Incorrect. Correct answer: ${question.correctChoice}`}
        </p>
      )}
    </div>
  );
}

export default Question;
