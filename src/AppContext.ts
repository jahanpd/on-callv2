import React from "react";
import type { SetStateAction, Dispatch } from "react";
import type { Alerts } from "./types";

type State = {
    seedHash: { supabaseHash: string, localHash: string }
    euaCheck: boolean
    alerts: Array<{ alert: Alerts, timestamp: number }>
}

type ContextProps = {
    state: State
    setSeedHash: Dispatch<SetStateAction<{ supabaseHash: string, localHash: string }>>
    setEuaCheck: Dispatch<SetStateAction<boolean>>
    setAlerts: Dispatch<SetStateAction<Array<{alert: Alerts, timestamp: number}>>>
    };

const AppContext = React.createContext<ContextProps | null>(null);

export default AppContext;
