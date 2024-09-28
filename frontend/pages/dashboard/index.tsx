// app/dashboard/page.tsx (or pages/dashboard.tsx if you're in Next.js 12)
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useUser } from "@auth0/nextjs-auth0/client";
import { withProtected } from "@/hoc";
import { useState } from "react";
import { useRouter } from "next/router";
import { FaPaperPlane } from "react-icons/fa"; // Example icon from react-icons

function Dashboard() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/learn");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-5xl font-semibold mb-6">
          Hello, {user?.name || "User"}!
        </h1>
        <p className="text-2xl font-light mb-10">
          What would you like to learn today?
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
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
        </form>
      </div>
    </div>
  );
}

export default withProtected(Dashboard);

export const getServerSideProps = withPageAuthRequired();
