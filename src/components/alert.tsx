import { useContext } from "react";
import AppContext from "../AppContext";
import type { SetStateAction, Dispatch } from "react";
import { Alert as AlertUI } from "@material-tailwind/react";
import type { Alerts, SyncError, SeedError } from '../types';

type Props = {
    alertcontent: Alerts | SeedError | SyncError
    alerts: Array<{ alert: Alerts | SeedError | SyncError, timestamp: number }>
    setAlerts: Dispatch<SetStateAction<Array<{alert: Alerts | SeedError | SyncError, timestamp: number}>>>
    force: Dispatch<SetStateAction<null>>
}

const Alert = ( { alertcontent, alerts, setAlerts, force } : Props ) => {
    const value = useContext(AppContext);

    function removeAlert(alertcontent: Alerts){
        setAlerts(alerts.filter((a) => a.alert !== alertcontent));
        console.log("post delete", alerts)
        force(null)
    }

    console.log("in alert", alertcontent)

    return (
        <div className="flex flex-row mx-2 sm:mx-4 mt-4">
            <AlertUI
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                }
                animate={{
                    mount: { y: 0 },
                    unmount: { y: 100 },
                }}
                dismissible={{
                    onClose: () => removeAlert(alertcontent),
                }}
                color="red"
            >
                {alertcontent}
            </AlertUI>
        </div>
    )
}

export default Alert;
