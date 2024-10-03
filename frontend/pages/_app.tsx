// pages/_app.tsx

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "../app/globals.css";
import { ProfilePopover } from "@/components";
import { AnimatePresence } from "framer-motion";

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <Provider store={store}>
      <UserProvider>
        <AnimatePresence mode="wait" initial={true}>
          <Component {...pageProps} key={router.route} />
        </AnimatePresence>
        <ProfilePopover />
      </UserProvider>
    </Provider>
  );
}

export default MyApp;
