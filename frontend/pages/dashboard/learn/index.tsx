// @/pages/dashboard/learn/index.tsx

// Imports
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { getQuestions, startSession } from "@/store/slices/knowledgeSlice";
import { dismissResetTip } from "@/store/slices/uiSlice";
import Question from "@/components/Question";
import GlassTooltip from "@/components/GlassTooltip";
import { Loader } from "@/components";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

// * Learn
/**
 * Manages the learning session, displaying questions and handling user interactions
 */
function Learn() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const controls = useAnimationControls();

  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(
    null
  );

  // Redux states
  const user = useAppSelector((state) => state.user.userInfo);
  const sessionId = useAppSelector((state) => state.user.sessionId);
  const currentTopic = useAppSelector((state) => state.knowledge.currentTopic);
  const questions = useAppSelector((state) => state.questions.questions);
  const sessionActive = useAppSelector(
    (state) => state.knowledge.sessionActive
  );
  const loading = useAppSelector((state) => state.knowledge.loading);
  const error = useAppSelector((state) => state.knowledge.error);
  const dismissedResetTip = useAppSelector(
    (state) => state.ui.dismissedResetTip
  );
  const allLoading = useAppSelector((state) => state.questions.loading);

  const someLoading = Object.values(allLoading).some((value) => value === true);

  useEffect(function handleMounting() {
    setMounted(true);
  }, []);

  useEffect(
    function handleRedirect() {
      if (mounted && (!user || !currentTopic || !sessionId)) {
        router.push("/");
      }
    },
    [mounted, currentTopic, user, router, sessionId]
  );

  useEffect(
    function handleSessionStart() {
      if (
        mounted &&
        user &&
        currentTopic &&
        questions.length === 0 &&
        sessionId
      ) {
        dispatch(startSession({ topic: currentTopic, sessionId }));
        controls.start("animate");
      }
    },
    [
      mounted,
      user,
      currentTopic,
      questions.length,
      dispatch,
      sessionId,
      controls,
    ]
  );

  useEffect(
    function handleGetQuestions() {
      if (sessionActive && sessionId && currentTopic) {
        dispatch(getQuestions({ topic: currentTopic, sessionId }));
      }
    },
    [sessionActive, sessionId, currentTopic, dispatch]
  );

  function handleQuestionHover(isHovering: boolean, questionId: string) {
    setShowTooltip(isHovering && someLoading);
    setHoveredQuestionId(isHovering ? questionId : null);
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100">
      <motion.div
        className="w-full max-w-2xl bg-white shadow-xl"
        variants={containerVariants}
        initial="initial"
        animate={controls}
      >
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {currentTopic || "Topic Title"}
          </h1>

          {!dismissedResetTip && !loading && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md">
              <div className="flex justify-between items-start">
                <p className="text-sm">
                  You can reset your topic by hovering over your name and
                  selecting reset.
                </p>
                <button
                  className="ml-4 text-blue-700 hover:text-blue-900 focus:outline-none"
                  onClick={() => dispatch(dismissResetTip())}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader show={loading} />
            </div>
          )}

          {error && (
            <div className="mb-6 text-red-500">
              <p>Error: {error}</p>
              <button
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => router.push("/")}
              >
                Go Home
              </button>
            </div>
          )}

          {currentTopic && (
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question._id}
                  layout
                  onMouseEnter={() =>
                    handleQuestionHover(true, String(question._id))
                  }
                  onMouseLeave={() =>
                    handleQuestionHover(false, String(question._id))
                  }
                >
                  <Question
                    question={question}
                    questionNumber={index + 1}
                    currentTopic={currentTopic}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <GlassTooltip show={showTooltip}>
        {hoveredQuestionId && allLoading[hoveredQuestionId]
          ? "This question is loading. Please wait."
          : "Please wait for the previous question's explanation before selecting an answer."}
      </GlassTooltip>
    </div>
  );
}

export default Learn;
