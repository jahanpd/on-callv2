import React from "react";
import type { SetStateAction, Dispatch } from "react";
import type { Alerts, SeedError, SyncError } from "./types";

type State = {
    seedHash: { supabaseHash: string, localHash: string }
    euaCheck: boolean
    alerts: Array<{ alert: Alerts | SeedError | SyncError , timestamp: number }>
}

type ContextProps = {
    state: State
    setSeedHash: Dispatch<SetStateAction<{ supabaseHash: string, localHash: string }>>
    setEuaCheck: Dispatch<SetStateAction<boolean>>
    setAlerts: Dispatch<SetStateAction<Array<{alert: Alerts | SeedError | SyncError, timestamp: number}>>>
    };

const AppContext = React.createContext<ContextProps | null>(null);

export default AppContext;
