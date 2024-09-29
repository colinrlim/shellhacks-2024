// components/GraphModal.tsx
import { useAppSelector } from "@/store/types";
import ModalWrapper from "./ModalWrapper";
import Graph from "./Graph";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GraphModal = ({ isOpen, onClose }: GraphModalProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useAppSelector((state) => state.user.userInfo);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Graph">
      <div className="mt-2">
        <Graph />
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

export default GraphModal;
