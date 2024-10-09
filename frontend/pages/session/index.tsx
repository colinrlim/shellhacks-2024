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
import { X } from "lucide-react";

function Learn() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const controls = useAnimationControls();

  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: string]: RefObject<HTMLDivElement> }>({});

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
  const settings = useAppSelector((state) => state.settings);
  const isDarkMode = settings.interface.theme === "dark";

  const someExplanationLoading = questions.some(
    (q) => q.selectedChoice && !q.explanation
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && (!user || !currentTopic || !sessionId)) {
      router.push("/");
    }
  }, [mounted, currentTopic, user, router, sessionId]);

  useEffect(() => {
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
  }, [
    mounted,
    user,
    currentTopic,
    questions.length,
    dispatch,
    sessionId,
    controls,
  ]);

  useEffect(() => {
    if (sessionActive && sessionId && currentTopic) {
      dispatch(getQuestions({ topic: currentTopic, sessionId }));
    }
  }, [sessionActive, sessionId, currentTopic, dispatch]);

  useEffect(() => {
    if (containerRef.current && questions.length > 0) {
      const lastUnansweredQuestionIndex = questions.findIndex(
        (q) => q.selectedChoice === undefined
      );
      if (lastUnansweredQuestionIndex !== -1) {
        const targetQuestionId = questions[lastUnansweredQuestionIndex]._id;
        const targetQuestionElement =
          questionRefs.current[targetQuestionId]?.current;
        if (targetQuestionElement) {
          targetQuestionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        // If all questions are answered, scroll to the last question
        const lastQuestionId = questions[questions.length - 1]._id;
        const lastQuestionElement =
          questionRefs.current[lastQuestionId]?.current;
        if (lastQuestionElement) {
          lastQuestionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }
  }, [questions]);

  function handleQuestionHover(isHovering: boolean, questionId: string) {
    const question = questions.find((q) => q._id.toString() === questionId);
    if (question) {
      setShowTooltip(
        (isHovering && (allLoading[questionId] || someExplanationLoading)) ||
          false
      );
      setHoveredQuestionId(isHovering ? questionId : null);
    }
  }

  function getTooltipContent() {
    if (!hoveredQuestionId) return "";
    const question = questions.find(
      (q) => q._id.toString() === hoveredQuestionId
    );
    if (!question) return "";

    if (allLoading[hoveredQuestionId]) {
      return "This question is loading. Please wait.";
    } else if (question.selectedChoice && !question.explanation) {
      return "Explanation is loading. Please wait.";
    } else if (someExplanationLoading) {
      return "Please wait for all explanations to load.";
    }
    return "";
  }

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
      transition: { duration: 0.5, delay: 0.2, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <motion.div
        className="flex-grow flex justify-center items-stretch w-full max-w-3xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          ref={containerRef}
          className={`w-full ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-xl rounded-lg overflow-hidden flex flex-col`}
          variants={contentVariants}
        >
          <div className="p-6 flex-grow overflow-y-auto">
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold mb-6 text-center"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                {currentTopic || "Topic Title"}
              </span>
            </motion.h1>

            {!dismissedResetTip && !loading && (
              <motion.div
                variants={itemVariants}
                className={`${
                  isDarkMode
                    ? "bg-blue-900 border-blue-700 text-blue-200"
                    : "bg-blue-100 border-blue-500 text-blue-700"
                } border-l-4 p-4 mb-6 rounded-md`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm">
                    You can reset your topic by clicking your profile below.
                  </p>
                  <button
                    className={`ml-4 ${
                      isDarkMode
                        ? "text-blue-300 hover:text-blue-100"
                        : "text-blue-700 hover:text-blue-900"
                    } focus:outline-none`}
                    onClick={() => dispatch(dismissResetTip())}
                    aria-label="Dismiss"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                variants={itemVariants}
                className="flex justify-center items-center h-64"
              >
                <Loader show={loading} />
              </motion.div>
            )}

            {error && (
              <motion.div variants={itemVariants} className="mb-6 text-red-500">
                <p>Error: {error}</p>
                <button
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
                  onClick={() => router.push("/")}
                >
                  Go Home
                </button>
              </motion.div>
            )}

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
                        isAnyQuestionLoading={someExplanationLoading}
                        isDarkMode={isDarkMode}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>

      <GlassTooltip show={showTooltip}>{getTooltipContent()}</GlassTooltip>
    </div>
  );
}

export default withProtected(Learn);

export const getServerSideProps = withPageAuthRequired();
