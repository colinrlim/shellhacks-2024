import React, { useState, useRef, useEffect } from "react";
import {
  Switch,
  Listbox,
  Transition,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Label,
  Field,
} from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import Portal from "./Portal";

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
  isDarkMode: boolean;
}

export const ToggleSwitch = ({
  enabled,
  setEnabled,
  label,
  isDarkMode,
}: ToggleSwitchProps) => {
  return (
    <Field>
      <div className="flex items-center justify-between">
        <Label
          className={`mr-4 text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label}
        </Label>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled
              ? "bg-indigo-600"
              : isDarkMode
              ? "bg-gray-600"
              : "bg-gray-200"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isDarkMode
              ? "focus:ring-offset-gray-800"
              : "focus:ring-offset-white"
          }`}
        >
          <span
            className={`${
              enabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Field>
  );
};

interface SelectMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  isDarkMode: boolean;
}

// Helper function to convert a string to proper case
const toProperCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const SelectMenu: React.FC<SelectMenuProps> = ({
  value,
  onChange,
  options,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <Listbox value={value} onChange={handleChange}>
      <div className="relative mt-1">
        <ListboxButton
          ref={buttonRef}
          className={`relative w-full cursor-default rounded-md py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white focus-visible:border-gray-300 focus-visible:ring-white focus-visible:ring-offset-gray-800"
              : "bg-gray-100 border-gray-300 text-gray-900 focus-visible:border-gray-500 focus-visible:ring-gray-500 focus-visible:ring-offset-white"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="block truncate">{toProperCase(value)}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown
              className={`h-5 w-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <Portal>
          <Transition
            show={isOpen}
            as={React.Fragment}
            leave="transition ease-in duration-50"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
              style={{
                top: `${buttonPosition.top}px`,
                left: `${buttonPosition.left}px`,
                width: `${buttonPosition.width}px`,
              }}
            >
              {options.map((option, optionIdx) => (
                <ListboxOption
                  key={optionIdx}
                  className={`relative cursor-default select-none py-2 pl-10 pr-4 ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-900 hover:bg-indigo-100 hover:text-indigo-900"
                  }`}
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {toProperCase(option)}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            isDarkMode ? "text-indigo-400" : "text-indigo-600"
                          }`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </Portal>
      </div>
    </Listbox>
  );
};
