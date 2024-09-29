import ModalWrapper from "./ModalWrapper";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Settings">
      Settings
      <button
        type="button"
        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none"
        onClick={onClose}
      >
        Close
      </button>
    </ModalWrapper>
  );
};

export default SettingsModal;
