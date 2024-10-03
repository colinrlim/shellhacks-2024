// @/components/Question.tsx

import React, { useEffect, useState, forwardRef } from "react";
import { Question as QuestionType } from "@/types";
import {
  answerClientSideQuestion,
  answerQuestion,
  fetchExplanation,
} from "@/store/slices/questionsSlice";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { Loader } from "@/components";
import { motion } from "framer-motion";

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
}

const Question = forwardRef<HTMLDivElement, QuestionProps>(
  ({ question, questionNumber, currentTopic }, ref) => {
    const dispatch = useAppDispatch();
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);

    const choices = Object.entries(question.choices).filter(
      ([key]) => !isNaN(Number(key))
    );

    const loading = useAppSelector(
      (state) => state.questions.loading[question._id]
    );

    useEffect(() => {
      let explanationInterval: NodeJS.Timeout;

      if (question.selectedChoice && !question.explanation) {
        setIsExplanationLoading(true);
        explanationInterval = setInterval(() => {
          dispatch(fetchExplanation(question._id)).then((action) => {
            if (
              fetchExplanation.fulfilled.match(action) &&
              action.payload?.explanation
            ) {
              clearInterval(explanationInterval);
              setIsExplanationLoading(false);
            }
          });
        }, 2000); // Check every 2 seconds
      } else if (question.explanation) {
        setIsExplanationLoading(false);
      }

      return () => {
        if (explanationInterval) {
          clearInterval(explanationInterval);
        }
      };
    }, [question.selectedChoice, question.explanation, dispatch, question._id]);

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

      setIsExplanationLoading(true);
    }

    const questionVariants = {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
      <motion.div
        ref={ref}
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
        {(isExplanationLoading || question.explanation) && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {isExplanationLoading && <Loader show={true} />}
            {question.explanation && (
              <p className="text-sm text-gray-600">{question.explanation}</p>
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

Question.displayName = "Question";

export default Question;
