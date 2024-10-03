// @/components/Question

// Imports
import React, { useEffect } from "react";
import { Question as QuestionType } from "@/types";
import {
  answerClientSideQuestion,
  answerQuestion,
} from "@/store/slices/questionsSlice";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { Loader } from "@/components";
import { motion } from "framer-motion";

// Question component props
interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  currentTopic: string;
}

// * Question
/**
 * Displays a question with choices and handles answering
 * TODO - Make answering client side, then send to server for explanation
 */
function Question({ question, questionNumber, currentTopic }: QuestionProps) {
  const dispatch = useAppDispatch();

  // ? This filters out the _id key from the choices object. We may want to review this later.
  const choices = Object.entries(question.choices).filter(
    ([key]) => !isNaN(Number(key))
  );

  // Handle answering the question
  const handleAnswerQuestion = (selectedChoice: 1 | 2 | 3 | 4) => {
    if (question.selectedChoice) return;

    // Handle the question on the client side
    dispatch(
      answerClientSideQuestion({
        questionId: question._id,
        selectedChoice,
        currentTopic,
      })
    );

    // Dispatch the event to the store
    dispatch(
      answerQuestion({
        questionId: question._id,
        selectedChoice,
        currentTopic,
      })
    );
  };

  // Get the loading state for the question
  const loading = useAppSelector(
    (state) => state.questions.loading[question._id]
  );

  // When loading is changed from true to false
  useEffect(() => {
    if (!loading) {
      // Scroll to the selected choice
      const selectedChoice = document.querySelector(
        `#question-${questionNumber}`
      );
      if (selectedChoice) {
        setTimeout(() => {
          selectedChoice.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    }
  }, [loading, questionNumber]);

  // #region Animations Start *****/
  const questionVariants = {
    initial: {
      opacity: 0,
      y: 100,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.2,
      },
    },
  };

  const choiceVariants = {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        ease: "easeOut",
        bounce: 0.4,
      },
    },
  };

  const answerVariants = {
    initial: {
      opacity: 0,
      x: -200,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const explanationVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };
  // #endregion Animations End *****/

  return (
    <motion.div
      className="mb-6 relative"
      variants={questionVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      id={`question-${questionNumber}`}
      layout
    >
      {" "}
      {/* Make the container relative for absolute positioning */}
      <p className="mb-2">
        Question #{questionNumber}: {question.question}
      </p>
      <div className="space-y-2 relative question__container">
        {" "}
        {/* Position relative to contain the absolute spinner */}
        {choices.map(([key, value]) => {
          const choiceKey = parseInt(key) as 1 | 2 | 3 | 4;
          let buttonClass = "w-full px-4 py-2 text-left border rounded";

          if (!question.selectedChoice) {
            buttonClass += " cursor-pointer";
          }

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
            <motion.button
              key={key}
              className={buttonClass}
              onClick={() => handleAnswerQuestion(choiceKey)}
              disabled={loading || question.isCorrect !== undefined}
              variants={choiceVariants}
              initial="initial"
              animate="animate"
              viewport={{ once: true }}
            >
              {value}
            </motion.button>
          );
        })}
      </div>
      {question.selectedChoice && (
        <motion.p
          className={`mt-2 ${
            question.isCorrect ? "text-green-500" : "text-red-500"
          }`}
          variants={answerVariants}
          initial="initial"
          animate="animate"
          viewport={{ once: true }}
        >
          {question.isCorrect
            ? "Correct!"
            : `Incorrect. Correct answer: ${question.correctChoice}`}
        </motion.p>
      )}
      {loading || question.explanation ? (
        <motion.div
          className={`inset-0 mt-2 bg-white bg-opacity-50 flex items-center justify-center align-top rounded ${
            !question.explanation ? "md:min-h-28" : ""
          }`}
          variants={explanationVariants}
          initial="initial"
          animate="animate"
          viewport={{ once: true }}
        >
          {loading && <Loader show={loading} />}
          <p className="text-gray-400 text-sm">{question.explanation}</p>
        </motion.div>
      ) : null}
      {/* {question.explanation ? (
        <motion.p
          className="text-gray-400 text-sm"
          variants={explanationVariants}
          initial="initial"
          animate="animate"
          viewport={{ once: true }}
        >
          {question.explanation}
        </motion.p>
      ) : (
        <motion.div
          className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded"
          variants={explanationVariants}
          initial="initial"
          animate="animate"
          viewport={{ once: true }}
        >
          <Loader show={loading} />
        </motion.div>
      )} */}
    </motion.div>
  );
}

export default Question;
