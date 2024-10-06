import React, { useEffect } from "react";
import { useAppSelector } from "@/store/types";
import { useAppDispatch } from "@/store";
import { updateSettings } from "@/store/slices/settingsSlice";
import { Moon, Sun } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.settings.interface.theme);
  const userInterface = useAppSelector((state) => state.settings.interface);
  const user = useAppSelector((state) => state.user.userInfo);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    if (!user || !user.auth0Id) return;
    dispatch(
      updateSettings({
        userId: user?.auth0Id,
        settings: { interface: { ...userInterface, theme: newTheme } },
      })
    );
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
