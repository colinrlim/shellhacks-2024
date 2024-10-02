// pages/_app.tsx

// Imports
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "../app/globals.css";
import { ProfilePopover } from "@/components";

// * Route Entrypoint
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <UserProvider>
        <Component {...pageProps} />
        <ProfilePopover />
      </UserProvider>
    </Provider>
  );
}

export default MyApp;
