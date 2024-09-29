import { useAppSelector } from "@/store/types";
import Graph from "./Graph";
import ModalWrapper from "./ModalWrapper";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GraphModal = ({ isOpen, onClose }: GraphModalProps) => {
  const knowledge = useAppSelector((state) => state.knowledge);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="mt-2">
        <Graph knowledge={knowledge} />
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
