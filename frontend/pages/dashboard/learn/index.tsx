// pages/learn/index.tsx

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { startSession } from "@/store/slices/knowledgeSlice";
import Question from "@/components/Question";
import Loader from "@/components/Loader";

function Learn() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const sessionId = useAppSelector((state) => state.user.sessionId);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const currentTopic = useAppSelector((state) => state.knowledge.currentTopic);
  const questions = useAppSelector((state) => state.questions.questions);
  const loading = useAppSelector((state) => state.knowledge.loading);
  const error = useAppSelector((state) => state.knowledge.error);

  // Ensure the component is mounted before routing
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to home if not logged in or no current topic
  useEffect(() => {
    if (mounted && (!user || !currentTopic || !sessionId)) {
      router.push("/");
    }
  }, [mounted, currentTopic, user, router]);

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
  }, [mounted, user, currentTopic, questions.length, dispatch]);

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100">
      {/* Center wrapper with borders */}
      <div className="w-full max-w-2xl bg-white border-x border-gray-300">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">
            {currentTopic || "Topic Title"}
          </h1>
          {/* Render questions */}
          {loading && (
            <>
              <Loader show={loading} />
            </>
          )}
          {/* Display Error if exists */}
          {error && (
            <div className="mb-4 text-red-500">
              <p>Error: {error}</p>
            </div>
          )}

          {currentTopic &&
            questions.map((question, index) => (
              <Question
                key={question.question}
                question={question}
                questionNumber={index + 1}
                currentTopic={currentTopic}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Learn;
