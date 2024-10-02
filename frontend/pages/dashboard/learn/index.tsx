// * /dashboard/learn

// Imports
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { getQuestions, startSession } from "@/store/slices/knowledgeSlice";
import { dismissResetTip } from "@/store/slices/uiSlice";
import Question from "@/components/Question";
import { Loader } from "@/components";

function Learn() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const sessionId = useAppSelector((state) => state.user.sessionId);
  const router = useRouter();

  // Local state for mounted
  const [mounted, setMounted] = useState(false);

  // Redux states
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

  // Ensure the component is mounted before routing
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to home if not logged in or no current topic
  useEffect(() => {
    if (mounted && (!user || !currentTopic || !sessionId)) {
      router.push("/");
    }
  }, [mounted, currentTopic, user, router, sessionId]);

  // Dispatch startSession when component mounts if currentTopic exists
  useEffect(() => {
    if (
      mounted &&
      user &&
      currentTopic &&
      questions.length === 0 &&
      sessionId
    ) {
      dispatch(
        startSession({
          topic: currentTopic,
          sessionId,
        })
      );
    }
  }, [mounted, user, currentTopic, questions.length, dispatch, sessionId]);

  // Now after sessionActive is changed from false to true, we can get the questions
  useEffect(() => {
    if (sessionActive && sessionId) {
      if (!currentTopic) throw new Error("Current topic is not set");
      dispatch(
        getQuestions({
          topic: currentTopic,
          sessionId,
        })
      );
    }
  }, [sessionActive, sessionId, currentTopic, dispatch]);

  return (
    <>
      <div className="flex justify-center w-full min-h-screen bg-gray-100">
        {/* Center wrapper with borders */}
        <div className="w-full max-w-2xl bg-white border-x border-gray-300">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
              {currentTopic || "Topic Title"}
            </h1>
            {!dismissedResetTip && (
              <div className="relative">
                <div
                  id="tip"
                  className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-md"
                  role="alert"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm">
                      You can reset your topic by hovering over your name and
                      selecting reset.
                    </p>
                    <button
                      className="ml-4 bg-transparent text-blue-700 hover:text-blue-900 focus:outline-none"
                      onClick={() => dispatch(dismissResetTip())}
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Render questions */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded">
                <Loader show={loading} />
              </div>
            )}
            {/* Display Error if exists */}
            {error && (
              <div className="mb-4 text-red-500">
                <p>Error: {error}</p>

                <button
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => router.push("/")}
                >
                  Go Home
                </button>
              </div>
            )}

            {currentTopic &&
              questions.map((question, index) => (
                <Question
                  key={index}
                  question={question}
                  questionNumber={index + 1}
                  currentTopic={currentTopic}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Learn;
