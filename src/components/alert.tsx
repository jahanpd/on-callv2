import { type NextPage } from "next";
import { useContext } from "react";
import AppContext from "../AppContext";

const Alert: NextPage = ( { alertcontent, alerts, setAlerts, force } ) => {
    const value = useContext(AppContext);

    function removeAlert(alertcontent: string){
        setAlerts(alerts.filter((a) => a !== alertcontent));
        console.log("post delete", alerts)
        force()
    }

    console.log("in alert", alertcontent)

    return (
        <div className="flex flex-row mx-2 sm:mx-4">
            <div
                className="text-rose-600 align-middle text-[0.7rem] sm:text-[0.9rem] font-normal py-2 w-full"
            >
                {alertcontent}
            </div>
            <div>
                <button
                    className="p-2 bg-red-300/40 border-1 border-red-400 rounded-xl"
                    onClick={() => removeAlert(alertcontent)}
                > righto </button>
            </div>
        </div>
    )
}

export default Alert;
