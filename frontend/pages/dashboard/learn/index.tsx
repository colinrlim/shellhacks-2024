// @/pages/dashboard/learn/index.tsx

import { useEffect, useState, useRef, RefObject, createRef } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { getQuestions, startSession } from "@/store/slices/knowledgeSlice";
import { dismissResetTip } from "@/store/slices/uiSlice";
import Question from "@/components/Question";
import GlassTooltip from "@/components/GlassTooltip";
import { Loader } from "@/components";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { withProtected } from "@/hoc";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

/**
 * Learn Component
 *
 * Manages the learning session, displaying questions and handling user interactions.
 * It uses Redux for state management and Framer Motion for animations.
 */
function Learn() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const controls = useAnimationControls();

  // Refs for managing scroll behavior
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: string]: RefObject<HTMLDivElement> }>({});

  // Local state
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(
    null
  );

  // Redux state selectors
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

  // Check if any question is currently loading
  const someLoading = Object.values(allLoading).some((value) => value === true);

  // Set mounted state on component mount
  useEffect(function handleMounting() {
    setMounted(true);
  }, []);

  // Redirect to home if necessary data is missing
  useEffect(
    function handleRedirect() {
      if (mounted && (!user || !currentTopic || !sessionId)) {
        router.push("/");
      }
    },
    [mounted, currentTopic, user, router, sessionId]
  );

  // Start the learning session when conditions are met
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

  // Fetch questions when the session is active
  useEffect(
    function handleGetQuestions() {
      if (sessionActive && sessionId && currentTopic) {
        dispatch(getQuestions({ topic: currentTopic, sessionId }));
      }
    },
    [sessionActive, sessionId, currentTopic, dispatch]
  );

  // Handle scrolling to the last answered question
  useEffect(() => {
    if (containerRef.current && questions.length > 0) {
      const lastAnsweredQuestionIndex =
        questions.findIndex((q) => q.selectedChoice === undefined) - 1;

      if (lastAnsweredQuestionIndex >= 0) {
        const lastAnsweredQuestionId = questions[lastAnsweredQuestionIndex]._id;
        const lastAnsweredQuestionElement =
          questionRefs.current[lastAnsweredQuestionId]?.current;

        if (lastAnsweredQuestionElement) {
          lastAnsweredQuestionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }
  }, [questions]);

  // Handle question hover for tooltip display
  function handleQuestionHover(isHovering: boolean, questionId: string) {
    setShowTooltip(isHovering && someLoading);
    setHoveredQuestionId(isHovering ? questionId : null);
  }

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Start animation on component mount
  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  return (
    <motion.div
      className="flex justify-center w-full min-h-screen bg-gray-100"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        ref={containerRef}
        className="w-full max-w-2xl bg-white shadow-xl overflow-y-auto min-h-screen"
        variants={contentVariants}
      >
        <div className="p-6">
          {/* Topic Title */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold mb-6 text-center"
          >
            {currentTopic || "Topic Title"}
          </motion.h1>

          {/* Reset Tip */}
          {!dismissedResetTip && !loading && (
            <motion.div
              variants={itemVariants}
              className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md"
            >
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
            </motion.div>
          )}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center h-64"
            >
              <Loader show={loading} />
            </motion.div>
          )}

          {/* Error display */}
          {error && (
            <motion.div variants={itemVariants} className="mb-6 text-red-500">
              <p>Error: {error}</p>
              <button
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => router.push("/")}
              >
                Go Home
              </button>
            </motion.div>
          )}

          {/* Questions display */}
          {currentTopic && (
            <AnimatePresence>
              {questions.map((question, index) => {
                if (!questionRefs.current[question._id]) {
                  questionRefs.current[question._id] =
                    createRef<HTMLDivElement>();
                }
                return (
                  <motion.div
                    key={question._id}
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="initial"
                    onMouseEnter={() =>
                      handleQuestionHover(true, String(question._id))
                    }
                    onMouseLeave={() =>
                      handleQuestionHover(false, String(question._id))
                    }
                  >
                    <Question
                      ref={questionRefs.current[question._id]}
                      question={question}
                      questionNumber={index + 1}
                      currentTopic={currentTopic}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Tooltip for loading states */}
      <GlassTooltip show={showTooltip}>
        {hoveredQuestionId && allLoading[hoveredQuestionId]
          ? "This question is loading. Please wait."
          : "Please wait for the explanation to load."}
      </GlassTooltip>
    </motion.div>
  );
}

// Wrap the Dashboard component with authentication protection
export default withProtected(Learn);

export const getServerSideProps = withPageAuthRequired();
