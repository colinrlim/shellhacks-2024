// @/components/Question.tsx

// Imports
import React from "react";
import { Question as QuestionType } from "@/types";
import {
  answerClientSideQuestion,
  answerQuestion,
} from "@/store/slices/questionsSlice";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { Loader } from "@/components";
import { motion } from "framer-motion";

// Types
interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
}

// * Question
/**
 * Displays a question with choices and handles answering
 */
function Question({ question, questionNumber, currentTopic }: QuestionProps) {
  const dispatch = useAppDispatch();

  const choices = Object.entries(question.choices).filter(
    ([key]) => !isNaN(Number(key))
  );

  function handleAnswerQuestion(selectedChoice: 1 | 2 | 3 | 4) {
    if (question.selectedChoice) return;

    dispatch(
      answerClientSideQuestion({
        questionId: question._id,
        selectedChoice,
        currentTopic,
      })
    );

    dispatch(
      answerQuestion({
        questionId: question._id,
        selectedChoice,
        currentTopic,
      })
    );
  }

  const loading = useAppSelector(
    (state) => state.questions.loading[question._id]
  );

  const questionVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="mb-4 bg-white rounded-lg shadow-md overflow-hidden"
      variants={questionVariants}
      initial="initial"
      animate="animate"
      layout
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          Question {questionNumber}: {question.question}
        </h3>
      </div>
      <div className="p-4">
        {choices.map(([key, value]) => {
          const choiceKey = parseInt(key) as 1 | 2 | 3 | 4;
          const isSelected = question.selectedChoice === choiceKey;
          const isCorrect = question.correctChoice === choiceKey;

          return (
            <button
              key={key}
              className={`w-full p-2 mb-2 text-left rounded transition-colors ${
                isSelected
                  ? isCorrect
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                  : "bg-gray-100 hover:bg-gray-200"
              } ${
                question.selectedChoice || loading
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              onClick={() => handleAnswerQuestion(choiceKey)}
              disabled={loading || question.selectedChoice !== undefined}
            >
              {value}
            </button>
          );
        })}
      </div>
      {(loading || question.explanation) && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {loading && <Loader show={loading} />}
          {question.explanation && (
            <p className="text-sm text-gray-600">{question.explanation}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default Question;
