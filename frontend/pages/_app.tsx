// pages/_app.tsx
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import AuthListener from "../components/AuthListener";
import "../app/globals.css";
import { ProfilePopover } from "@/components";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <UserProvider>
        <AuthListener />
        <Component {...pageProps} />
        <ProfilePopover />
      </UserProvider>
    </Provider>
  );
}

export default MyApp;
