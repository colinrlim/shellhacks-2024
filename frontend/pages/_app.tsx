// pages/_app.tsx

import { UserProvider } from "@auth0/nextjs-auth0/client";
import type { AppProps } from "next/app";
import "../app/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
