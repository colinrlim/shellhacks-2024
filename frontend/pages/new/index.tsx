import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";
import { setCurrentTopic, resetSession } from "@/store/slices/knowledgeSlice";
import { withProtected } from "@/hoc";
import { setQuestions } from "@/store/slices/questionsSlice";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";

function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const settings = useAppSelector((state) => state.settings);
  const isDarkMode = settings.interface.theme === "dark";
  const userName = settings.account?.name || "User";

  const [input, setInput] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExiting(true);

    dispatch(resetSession());
    dispatch(setQuestions([]));
    dispatch(setCurrentTopic(input));
    router.push("/session");
  };

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

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
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

  return (
    <div
      className={`flex min-h-screen items-center justify-center ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <motion.div
        className="text-center px-4 max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.h1
          variants={childVariants}
          className="text-5xl md:text-6xl font-bold mb-3"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Hello, {userName}!
          </span>
        </motion.h1>

        <motion.p
          variants={childVariants}
          className={`text-2xl md:text-3xl font-light mb-10 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          What would you like to learn today?
        </motion.p>

        <motion.form
          variants={childVariants}
          onSubmit={handleSubmit}
          className="relative"
        >
          <input
            type="text"
            className={`block w-full py-4 px-6 text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out shadow-lg ${
              isDarkMode
                ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
            }`}
            placeholder="Enter a topic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            disabled={isExiting}
          />
          <button
            type="submit"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${
              isDarkMode
                ? "text-gray-300 hover:text-blue-400 focus:ring-2 focus:ring-blue-500"
                : "text-gray-600 hover:text-blue-500 focus:ring-2 focus:ring-blue-500"
            }`}
            aria-label="Submit"
            disabled={isExiting}
          >
            <SendHorizontal className="h-6 w-6" />
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default withProtected(Dashboard);

export const getServerSideProps = withPageAuthRequired({
  returnTo: "/learn/dashboard",
});
