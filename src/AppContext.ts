import React from "react";
import type { SetStateAction, Dispatch } from "react";

type State = {
    seedHash: string
    euaCheck: boolean
    alerts: Array<string>
}

type ContextProps = {
    state: State
    setSeedHash: Dispatch<SetStateAction<string>>
    setEuaCheck: Dispatch<SetStateAction<boolean>>
    setAlerts: Dispatch<SetStateAction<Array<string>>>
    };

const AppContext = React.createContext<ContextProps | null>(null);

export default AppContext;
