import { Transition } from "@headlessui/react";

interface LoaderProps {
  show: boolean;
}

function Loader({ show }: LoaderProps) {
  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-200 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex justify-center items-center py-10">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    </Transition>
  );
}

export default Loader;
