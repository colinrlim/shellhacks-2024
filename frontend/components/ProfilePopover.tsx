import { useState } from "react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useAppDispatch } from "@/store";
import { useAppSelector } from "@/store/types";
import { clearUser } from "@/store/slices/userSlice";
import {
  closeProfileModal,
  closeSettingsModal,
  openProfileModal,
  openSettingsModal,
} from "@/store/slices/uiSlice";
import ProfileModal from "./ProfileModal";

const ProfilePopover: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  if (!user) dispatch(clearUser());
  const { name } = user || {};

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

  const isSettingsModalOpen = useAppSelector(
    (state) => state.ui.isSettingsModalOpen
  );
  const toggleSettingsModal = () => {
    if (isSettingsModalOpen) dispatch(closeSettingsModal());
    else {
      setIsHovered(false);
      dispatch(openSettingsModal());
    }
  };

  const [isHovered, setIsHovered] = useState(false);

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
              className="w-full text-left block px-4 py-2 text-black hover:bg-white hover:bg-opacity-10 transition-colors"
              onClick={toggleProfileModal}
            >
              Profile
            </button>
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
        <span className="text-black truncate">{name}</span>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={toggleProfileModal} />
    </div>
  );
};

export default ProfilePopover;
