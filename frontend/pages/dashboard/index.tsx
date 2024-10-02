// * /dashboard

// Imports
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { useRouter } from "next/router";
import { FaPaperPlane } from "react-icons/fa"; // Example icon from react-icons
import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";
import { setCurrentTopic, resetSession } from "@/store/slices/knowledgeSlice";
import { withProtected } from "@/hoc";
import { setQuestions } from "@/store/slices/questionsSlice";
import { motion, useAnimationControls } from "framer-motion";

// Dashboard Component
function Dashboard() {
  const dispatch = useAppDispatch();
  const controls = useAnimationControls();
  const user = useAppSelector((state) => state.user.userInfo);
  const router = useRouter();
  const { name } = user || {};

  // Local state for input
  const [input, setInput] = useState("");

  // Handle topic submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    controls.start("exit");

    setTimeout(() => {
      // First, we dispatch a sessionReset() to ensure the session is reset, in case this is not the first time the user is selecting a topic
      dispatch(resetSession());
      dispatch(setQuestions([]));

      // Set current topic in Redux store
      dispatch(setCurrentTopic(input));
      router.push("/dashboard/learn");
    }, 600);
  };

  // Animation Variants
  const headerVariants = {
    initial: {
      opacity: 0,
      y: -250,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -250,
      transition: {
        duration: 0.6,
        amount: 0.2,
        ease: "easeOut",
      },
    },
  };

  const labelVariants = {
    initial: { opacity: 0, y: -250 },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -250,
      transition: {
        duration: 0.4,
        amount: 0.2,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const formVariants = {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: {
      opacity: 0,
      y: 200,
      transition: {
        duration: 0.8,
        amount: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <motion.div className="text-center">
        <motion.h1
          className="text-5xl font-semibold mb-6"
          variants={headerVariants}
          initial="initial"
          animate={controls}
          whileInView="animate"
          transition={{
            duration: 0.6,
            amount: 0.2,
            ease: "easeOut",
            delay: 0.2,
          }}
          exit="exit"
        >
          Hello, {name || "User"}!
        </motion.h1>
        <motion.p
          className="text-2xl font-light mb-10"
          variants={labelVariants}
          initial="initial"
          animate={controls}
          whileInView="animate"
          exit="exit"
          transition={{ duration: 0.6, amount: 0.2, ease: "easeOut" }}
        >
          What would you like to learn today?
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto"
          variants={formVariants}
          initial="initial"
          animate={controls}
          whileInView="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            amount: 0.2,
            ease: "easeOut",
            delay: 0.4,
          }}
        >
          <input
            type="text"
            className="block w-full py-4 px-6 text-xl border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-500"
            placeholder="Type here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />

          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaPaperPlane className="h-6 w-6" />
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default withProtected(Dashboard);

export const getServerSideProps = withPageAuthRequired();
