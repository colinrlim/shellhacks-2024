import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

const ProfilePopover: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading) return null; // Or a loader component
  if (error)
    return (
      <div className="fixed bottom-4 left-4 z-50 text-red-500">
        Error: {error.message}
      </div>
    );
  if (!user) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 border-gray-300 border rounded-md group hover:rounded-t-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded Options */}
      <div
        className={`
          bottom-full left-0
          bg-white bg-opacity-20 backdrop-blur-lg 
          rounded-lg overflow-hidden 
          transition-all duration-300
          ${isHovered ? "opacity-100 max-h-60" : "opacity-0 max-h-0"}
        `}
      >
        <ul className="flex flex-col">
          <li>
            <Link
              className="block px-4 py-2 text-black hover:bg-white hover:bg-opacity-10 transition-colors"
              href="/profile"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              className="block px-4 py-2 text-black hover:bg-white hover:bg-opacity-10 transition-colors"
              href="/settings"
            >
              Settings
            </Link>
          </li>
          <li>
            <Link
              href="/api/auth/logout"
              className="block px-4 py-2 text-black hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Logout
            </Link>
          </li>
        </ul>
      </div>
      <div
        className={`
          flex items-center p-3 bg-white bg-opacity-20 backdrop-blur-lg 
          shadow-lg transition-all duration-300 
          cursor-pointer px-6 group-hover:border-t group-hover:border-gray-300 gap-2
        `}
      >
        <FaUser className="text-black text-xl mr-2" />
        <span className="text-black truncate">{user.name}</span>
      </div>
    </div>
  );
};

export default ProfilePopover;
