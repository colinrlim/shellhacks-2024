// @/components/Question.tsx

import React, { useEffect, useState, forwardRef, useCallback } from "react";
import { Question as QuestionType } from "@/types";
import {
  answerClientSideQuestion,
  answerQuestion,
  fetchExplanation,
} from "@/store/slices/questionsSlice";
import { getQuestions } from "@/store/slices/knowledgeSlice";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { Loader } from "@/components";
import { motion } from "framer-motion";

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
  isAnyQuestionLoading: boolean;
}

const Question = forwardRef<HTMLDivElement, QuestionProps>(
  ({ question, questionNumber, currentTopic, isAnyQuestionLoading }, ref) => {
    const dispatch = useAppDispatch();
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);

    const loading = useAppSelector(
      (state) => state.questions.loading[question._id]
    );
    const allQuestions = useAppSelector((state) => state.questions.questions);
    const sessionId = useAppSelector((state) => state.user.sessionId);
    const isSessionActive = useAppSelector(
      (state) => state.knowledge.sessionActive
    );

    const choices = Object.entries(question.choices).filter(
      ([key]) => !isNaN(Number(key))
    );

    const checkAndFetchMoreQuestions = useCallback(() => {
      const allQuestionsAnswered = allQuestions.every(
        (q) => q.selectedChoice !== undefined
      );
      const noUnansweredQuestions = allQuestions.every(
        (q) => q.selectedChoice !== undefined
      );

      if (
        allQuestionsAnswered &&
        noUnansweredQuestions &&
        isSessionActive &&
        sessionId
      ) {
        dispatch(getQuestions({ topic: currentTopic, sessionId }));
      }
    }, [allQuestions, isSessionActive, sessionId, dispatch, currentTopic]);

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
              checkAndFetchMoreQuestions();
            }
          });
        }, 2000);
      } else if (question.explanation) {
        setIsExplanationLoading(false);
      }

      return () => {
        if (explanationInterval) {
          clearInterval(explanationInterval);
        }
      };
    }, [
      question.selectedChoice,
      question.explanation,
      dispatch,
      question._id,
      checkAndFetchMoreQuestions,
    ]);

    function handleAnswerQuestion(selectedChoice: 1 | 2 | 3 | 4) {
      if (question.selectedChoice || isAnyQuestionLoading) return;

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
        id={`question-${question._id}`}
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
                  question.selectedChoice || loading || isAnyQuestionLoading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() => handleAnswerQuestion(choiceKey)}
                disabled={
                  loading ||
                  question.selectedChoice !== undefined ||
                  isAnyQuestionLoading
                }
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
