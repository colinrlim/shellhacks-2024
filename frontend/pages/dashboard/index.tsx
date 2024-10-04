import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/store";
import { setCurrentTopic, resetSession } from "@/store/slices/knowledgeSlice";
import { withProtected } from "@/hoc";
import { setQuestions } from "@/store/slices/questionsSlice";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import { useAppSelector } from "@/store/types";

function Dashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const router = useRouter();
  const { name } = user || {};

  // State for the topic input and animation control
  const [input, setInput] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExiting(true);

    // Reset the session and questions, then set the new topic
    dispatch(resetSession());
    dispatch(setQuestions([]));
    dispatch(setCurrentTopic(input));
    router.push("/dashboard/learn");
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for child elements
  const childVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <motion.div
      className="flex h-screen items-center justify-center bg-gray-100 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="text-center px-4 max-w-2xl w-full">
        {/* Greeting */}
        <motion.h1
          variants={childVariants}
          className="text-4xl md:text-5xl font-semibold mb-4 text-gray-800"
        >
          Hello, {name || "User"}!
        </motion.h1>
        {/* Prompt */}
        <motion.p
          variants={childVariants}
          className="text-xl md:text-2xl font-light mb-8 text-gray-600"
        >
          What would you like to learn today?
        </motion.p>

        {/* Topic input form */}
        <motion.form
          variants={childVariants}
          onSubmit={handleSubmit}
          className="relative"
        >
          <input
            type="text"
            className="block w-full py-3 px-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 ease-in-out shadow-sm"
            placeholder="Enter a topic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            disabled={isExiting}
          />

          {/* Submit button */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 focus:outline-none transition-colors duration-200 ease-in-out"
            aria-label="Submit"
            disabled={isExiting}
          >
            <SendHorizontal className="h-6 w-6" />
          </button>
        </motion.form>
      </div>
    </motion.div>
  );
}

// Wrap the Dashboard component with authentication protection
export default withProtected(Dashboard);

export const getServerSideProps = withPageAuthRequired({
  returnTo: "/learn/dashboard",
});
