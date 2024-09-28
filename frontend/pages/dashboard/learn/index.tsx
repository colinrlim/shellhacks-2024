// pages/learn/
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { withProtected } from "@/hoc";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";

function Learn() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  // get the current topic from the store
  const currentTopic = useAppSelector((state) => state.knowledge.currentTopic);

  // First we need to verify this component has been mounted to the DOM. if we do not do this, the router will throw an error since its trying to redirect from a server side rendered page
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || !currentTopic)) {
      router.push("/");
    }
  }, [mounted, currentTopic, user, router]);

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100">
      {/* Center wrapper with borders */}
      <div className="w-full max-w-2xl bg-white border-x border-gray-300">
        {/* Placeholder for dynamic content like questions */}
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">
            {currentTopic || "Topic Title"}
          </h1>
          {/* Placeholder questions */}
          <div className="mb-6">
            <p className="mb-2">Question 1: Placeholder text for question?</p>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 1
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 2
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 3
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 4
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-2">Question 2: Placeholder text for question?</p>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 1
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 2
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 3
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-100 border rounded">
                Option 4
              </button>
            </div>
          </div>

          {/* Add more questions as needed */}
        </div>
      </div>
    </div>
  );
}

export default Learn;
