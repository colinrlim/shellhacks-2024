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
// import GraphModal from "./GraphModal";
import { IoPersonCircleOutline } from "react-icons/io5";
import { SlLogout } from "react-icons/sl";
import { PiGlobeSimple } from "react-icons/pi";

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
              className="w-full text-left text-md block px-4 py-2 text-black transition-colors"
              onClick={toggleProfileModal}
            >
              <IoPersonCircleOutline className="inline-block text-md mr-5 ml-2" />
              Profile
            </button>
          </li>
          <li className="hidden">
            <button
              className="w-full text-left block text-md px-4 py-2 text-black transition-colors"
              onClick={toggleSettingsModal}
            >
              <PiGlobeSimple className="inline-block text-md mr-5 ml-2" />
              Graph
            </button>
          </li>
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

      {/* Graph Modal */}
      
    </div>
  );
};

export default ProfilePopover;
