import { type AppType } from "next/app";
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import AppContext from "../AppContext";

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
  const [seedHash, setSeedHash] = useState("");
  const [euaCheck, setEuaCheck] = useState(false);
  const [alerts, setAlerts] = useState(["dismiss me"]);

  // custom theming
  const customTheme = {

  }


  return (
    <ThemeProvider value={customTheme}>
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
