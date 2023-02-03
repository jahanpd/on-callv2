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
          <Component {...pageProps} />
        </SessionContextProvider>
      </AppContext.Provider>
    </ThemeProvider>
  )
}

  export default api.withTRPC(MyApp);
