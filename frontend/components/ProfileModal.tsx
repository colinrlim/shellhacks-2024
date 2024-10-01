// components/ProfileModal

// Imports
import { useAppSelector } from "@/store/types";
import { ModalWrapper } from "@/components";

// ProfileModal component props
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// * Profile Modal
/**
 * This is a modal that shows the user's profile information.
 * TODO - Make the profile information editable
 */
const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const user = useAppSelector((state) => state.user.userInfo);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="mt-2">
        <p className="text-sm text-gray-500">Name: {user?.name}</p>
        <p className="text-sm text-gray-500">Email: {user?.email}</p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ProfileModal;
