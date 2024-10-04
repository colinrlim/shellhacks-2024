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

// Define the props interface for the Question component
interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
}

// Create a forwardRef component to allow ref forwarding
const Question = forwardRef<HTMLDivElement, QuestionProps>(
  ({ question, questionNumber, currentTopic }, ref) => {
    const dispatch = useAppDispatch();
    // State to manage the loading state of the explanation
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);

    // Filter and extract the choices from the question object
    const choices = Object.entries(question.choices).filter(
      ([key]) => !isNaN(Number(key))
    );

    // Select the loading state for this specific question from the Redux store
    const loading = useAppSelector(
      (state) => state.questions.loading[question._id]
    );

    // Effect to handle fetching and updating the explanation
    useEffect(() => {
      let explanationInterval: NodeJS.Timeout;

      if (question.selectedChoice && !question.explanation) {
        setIsExplanationLoading(true);
        // Set up an interval to periodically check for the explanation
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

      // Clean up the interval on component unmount
      return () => {
        if (explanationInterval) {
          clearInterval(explanationInterval);
        }
      };
    }, [question.selectedChoice, question.explanation, dispatch, question._id]);

    // Handle the user selecting an answer
    function handleAnswerQuestion(selectedChoice: 1 | 2 | 3 | 4) {
      if (question.selectedChoice) return;

      // Dispatch actions to update the state locally and on the server
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

    // Animation variants for the question component
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
        {/* Question header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Question {questionNumber}: {question.question}
          </h3>
        </div>
        {/* Answer choices */}
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
        {/* Explanation section */}
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

// Set a display name for the component (useful for debugging)
Question.displayName = "Question";

export default Question;
