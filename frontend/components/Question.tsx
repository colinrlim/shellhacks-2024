import React, { useEffect, useState, forwardRef, useCallback } from "react";
import { Question as QuestionType } from "@/types";
import {
  answerClientSideQuestion,
  answerQuestion,
  favoriteQuestion,
  fetchExplanation,
} from "@/store/slices/questionsSlice";
import { getQuestions } from "@/store/slices/knowledgeSlice";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { Loader } from "@/components";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
  isAnyQuestionLoading: boolean;
  isDarkMode: boolean;
}

const Question = forwardRef<HTMLDivElement, QuestionProps>(
  (
    {
      question,
      questionNumber,
      currentTopic,
      isAnyQuestionLoading,
      isDarkMode,
    },
    ref
  ) => {
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
      if (allQuestionsAnswered && isSessionActive && sessionId) {
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

    function handleFavoriteQuestion() {
      if (!sessionId || loading || isAnyQuestionLoading) return;
      dispatch(favoriteQuestion({ questionId: question._id, sessionId })).then(
        () => {
          dispatch(getQuestions({ topic: currentTopic, sessionId }));
        }
      );
    }

    const disableFavoriteButton =
      loading || isAnyQuestionLoading || question.favorited;

    const questionVariants = {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
      <motion.div
        ref={ref}
        id={`question-${question._id}`}
        className={`mb-6 rounded-lg shadow-md overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
        variants={questionVariants}
        initial="initial"
        animate="animate"
        layout
      >
        <div
          className={`p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Question {questionNumber}
            </h3>
            {question.selectedChoice && (
              <button
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } ${
                  disableFavoriteButton ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleFavoriteQuestion}
                aria-label="Favorite question"
                disabled={disableFavoriteButton}
              >
                <Star
                  size={20}
                  className={
                    question.favorited
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }
                />
              </button>
            )}
          </div>
          <p
            className={`mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {question.question}
          </p>
        </div>
        <div className="p-4">
          {choices.map(([key, value]) => {
            const choiceKey = parseInt(key) as 1 | 2 | 3 | 4;
            const isSelected = question.selectedChoice === choiceKey;
            const isCorrect = question.correctChoice === choiceKey;

            return (
              <button
                key={key}
                className={`w-full p-3 mb-3 text-left rounded-md transition-colors ${
                  isSelected
                    ? isCorrect
                      ? isDarkMode
                        ? "bg-green-800 text-white"
                        : "bg-green-100 text-green-800"
                      : isDarkMode
                      ? "bg-red-800 text-white"
                      : "bg-red-100 text-red-800"
                    : isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                } ${
                  loading || isAnyQuestionLoading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() => handleAnswerQuestion(choiceKey)}
                disabled={loading || isAnyQuestionLoading}
              >
                {value}
              </button>
            );
          })}
        </div>
        {(isExplanationLoading || question.explanation) && (
          <div
            className={`p-4 border-t ${
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {isExplanationLoading && <Loader show={true} />}
            {question.explanation && (
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {question.explanation}
              </p>
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

Question.displayName = "Question";

export default Question;
