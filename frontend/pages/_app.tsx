// pages/_app.tsx

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "../app/globals.css";
import { ProfilePopover } from "@/components";
import { AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/types";
import { useEffect } from "react";

// New component that uses Redux
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useAppSelector((state) => state.settings.interface.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      {children}
    </div>
  );
};

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <Provider store={store}>
      <UserProvider
        loginUrl="/learn/api/auth/login"
        profileUrl="/learn/api/auth/me"
      >
        <ThemeWrapper>
          <AnimatePresence mode="wait" initial={true}>
            <Component {...pageProps} key={router.route} />
          </AnimatePresence>
          <ProfilePopover />
        </ThemeWrapper>
      </UserProvider>
    </Provider>
  );
}

export default MyApp;
