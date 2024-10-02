// @/components/ProfilePopover

// Imports
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { clearUser } from "@/store/slices/userSlice";
import { closeProfileModal, openProfileModal } from "@/store/slices/uiSlice";
import ProfileModal from "./ProfileModal";
import { IoPersonCircleOutline } from "react-icons/io5";
import { SlLogout } from "react-icons/sl";
import { usePathname } from "next/navigation";
import { RxReset } from "react-icons/rx";

function ProfilePopover() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // User info fetched from the store
  const user = useAppSelector((state) => state.user.userInfo);
  if (!user) dispatch(clearUser());
  const { name } = user || {};

  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);

  // State for the profile modal open/close
  const isProfileModalOpen = useAppSelector(
    (state) => state.ui.isProfileModalOpen
  );
  const toggleProfileModal = () => {
    if (isProfileModalOpen) dispatch(closeProfileModal());
    else {
      setIsHovered(false);
      dispatch(openProfileModal());
    }
  };

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
            <button
              className="w-full text-left text-md block px-4 py-2 text-black transition-colors"
              onClick={toggleProfileModal}
            >
              <IoPersonCircleOutline className="inline-block text-md mr-5 ml-2" />
              Profile
            </button>
          </li>
          {pathname !== "/dashboard" && (
            <li>
              <Link
                href="/dashboard"
                className="w-full text-left block text-md px-4 py-2 text-black transition-colors"
              >
                <RxReset className="inline-block text-md mr-5 ml-2" />
                Reset Topic
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/api/auth/logout"
              className="w-full text-left block text-md px-4 py-2 text-black transition-colors"
            >
              <SlLogout className="inline-block text-md mr-5 ml-2" />
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
        <span className="text-black truncate">{name}</span>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={toggleProfileModal} />
    </div>
  );
}

export default ProfilePopover;
