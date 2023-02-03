import Head from 'next/head';
import type { AppProps } from "next/app";
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, type Session } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import AppContext from "../AppContext";
import { Alerts, SeedError, SyncError } from "../types";

import { ThemeProvider } from "@material-tailwind/react";

import { api } from "../utils/api";

import "../styles/globals.css";

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  const [seedHash, setSeedHash] = useState({
    supabaseHash: "",
    localHash: ""
  });
  const [euaCheck, setEuaCheck] = useState(false);
  const initAlert: Array<{alert: Alerts | SeedError | SyncError, timestamp: number}> = [];
  const [alerts, setAlerts] = useState(initAlert);

  return (
    <ThemeProvider>
      <AppContext.Provider
        value={{
          state: {
            seedHash: seedHash,
            euaCheck: euaCheck,
            alerts: alerts,
          },
          setSeedHash: setSeedHash,
          setEuaCheck: setEuaCheck,
          setAlerts: setAlerts,
        }}
      >
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <Head>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
            />

            <link rel="manifest" href="/manifest.json" />
            <link
              href="/favicon-16x16.png"
              rel="icon"
              type="image/png"
              sizes="16x16"
            />
            <link
              href="/favicon-32x32.png"
              rel="icon"
              type="image/png"
              sizes="32x32"
            />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png"></link>
          </Head>
          <Component {...pageProps} />
        </SessionContextProvider>
      </AppContext.Provider>
    </ThemeProvider>
  )
}

  export default api.withTRPC(MyApp);
