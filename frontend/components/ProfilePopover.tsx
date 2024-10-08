// @/components/profilePopover

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { clearUser } from "@/store/slices/userSlice";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, RefreshCcw, Cog } from "lucide-react";

function ProfilePopover() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Get user info from Redux store
  const user = useAppSelector((state) => state.user.userInfo);
  if (!user) dispatch(clearUser());
  const { name } = user || {};

  // Local state to manage popover open/closed state
  const [isOpen, setIsOpen] = useState(false);

  // Toggle popover open/closed state
  const toggleOpen = () => setIsOpen(!isOpen);

  // Close popover
  const closePopover = () => setIsOpen(false);

  // Handle navigation and close popover
  const handleNavigation = (path: string) => {
    closePopover();
    router.push(path);
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        closePopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Animation variants for the container
  const containerVariants = {
    closed: { width: "auto", height: "40px" },
    open: { width: "200px", height: "auto", transition: { duration: 0.2 } },
  };

  // Animation variants for the options
  const optionsVariants = {
    closed: { opacity: 0, y: -10, pointerEvents: "none" as const },
    open: { opacity: 1, y: 0, pointerEvents: "auto" as const },
  };

  return (
    <motion.div
      ref={popoverRef}
      className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={containerVariants}
    >
      {/* User button to toggle popover */}
      <button
        className="w-full h-10 px-4 flex items-center justify-start text-gray-800 hover:bg-gray-50 transition-colors"
        onClick={toggleOpen}
      >
        <span className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center text-sm font-medium mr-3">
          {name?.[0]?.toUpperCase() || "U"}
        </span>
        <span className="text-sm font-medium truncate">{name}</span>
      </button>

      {/* Animated popover content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={optionsVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="px-2 pb-2"
          >
            {/* Reset Topic button (only shown when not on dashboard) */}
            {pathname !== "/new" && (
              <button
                onClick={() => handleNavigation("/new")}
                className="w-full text-left text-sm py-2 px-2 text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center"
              >
                <RefreshCcw size={16} className="mr-2" />
                {pathname === "/topics"
                  ? "Return to Dashboard"
                  : "Start New Session"}
              </button>
            )}
            {pathname !== "/settings" && (
              <button
                onClick={() => handleNavigation("/settings")}
                className="w-full text-left text-sm py-2 px-2 text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center"
              >
                <Cog size={16} className="mr-2" />
                Settings
              </button>
            )}
            {/* Logout button */}
            <Link
              href="/api/auth/logout"
              className="w-full text-left text-sm py-2 px-2 text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center"
              onClick={closePopover}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProfilePopover;
