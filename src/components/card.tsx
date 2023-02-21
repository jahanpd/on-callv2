import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@supabase/auth-helpers-react';
import { Status, SyncError, Alerts } from '../types';
import type { SetStateAction, Dispatch } from "react";
import type { ChangeEventHandler } from "react";
import { useState, useContext } from 'react';
import { getOffsetTimeString } from '../pages/home';
import Select from 'react-select'
import DatePicker from 'react-date-picker/dist/entry.nostyle';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    IconButton,
} from "@material-tailwind/react";
import { db, type Card as CardType } from "../database.config";
import { checkDataSync } from "../checks-and-balance";
import type { Database } from '../utils/supabaseTypes';
import AppContext from "../AppContext";

import { useSpring, animated, SpringValue } from '@react-spring/web';


type Props = {
    card: CardType
    selected: string
    setSelected: Dispatch<SetStateAction<string>>,
    bgProps: { opacity: SpringValue<number> }
}

const Card = ({ card, selected, setSelected, bgProps }: Props) => {

    const value = useContext(AppContext);
    const alerts = value ? value.state.alerts : [];
    const setAlerts = value ? value.setAlerts : () => {[]};

    const supabaseClient = useSupabaseClient<Database>();
    const user = useUser();

    const [openCard, setOpenCard] = useState("");
    /* let openCard: "open" | "closed" | null = null; */

    if (selected == card.cardId && !openCard) {
        setOpenCard("open");
    } else if (selected != card.cardId && !openCard) {
        setOpenCard("closed")
    }

    console.log("CARD, CHECK SELECTED", selected)
    const selectCard = () => {
        setSelected(card.cardId);
        /* openCard = "open"; */
        setOpenCard("open");
        console.log("CARD", selected, card.cardId, openCard )
    };
    const deselectCardSimple = () => {
        setSelected("");
        /* openCard = "closed"; */
        setOpenCard("closed");
    };
    const deselectCard = () => {
        setSelected("");
        /* openCard = "closed"; */
        setOpenCard("open");
        // this causes a rerender of the list to remove changes
        void (async () => {
            await db.cards.where("cardId").equals(card.cardId).modify((c: CardType) => {c.cardId = c.cardId});
        })()
    };

    const options = []
    let k: keyof typeof Status;
    for (k in Status) {
        options.push({
            value: Status[k],
            label: Status[k]
        })
    }

    // handlers
    const handleUrnEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        card.urn = e.target.innerText;
    }
    const handleNameEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        card.name = e.target.innerText;
    }
    const handleDobEdit = (e: Date | null) => {
        card.dob = e?.getTime();
    }
    const handleSummaryEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        card.summary = e.target.innerText;
    }
    const handleContentEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        card.content = e.target.innerText;
    }
    const handleStatusEdit = (e: string | undefined) => {
        const newStatus: Status = e ? Status[e as keyof typeof Status] : Status.Pending;
        card.status = newStatus;
    }


    const handleSaveCard = () => {
        if (!user) return null
        void (async () => {
            card.timestampEdit = Date.now()
            await db.cards.where("cardId").equals(card.cardId).modify(card);
            const msg = await checkDataSync(
                user,
                supabaseClient,
                db,
                1
            )
            console.log("SAVE MSG", msg)
            if (msg != SyncError.Passed) {
                alerts.push(
                    {alert: Alerts.SaveOperation, timestamp:Date.now()}
                )
                setAlerts(alerts)
            }
        })();
    }

    type borderColourType = "white" | "red-500" | "orange-500" | "green-500" | "cyan-500"
    const borderColour: borderColourType = card.status == Status.Admitted  ||
                                            card.status == Status.Discharged  ? "green-500" :
                                            card.status == Status.Pending ? "red-500" :
                                            card.status == Status.Seen ? "orange-500" :
                                            card.status == Status.Completed ? "white" :
                                            card.status == Status.Transfer ? "cyan-500" : "white"



    const closedHeader = (
        <div onClick={selectCard} className="">
            <div className={`text-white/70 p-2 flex flex-row items-center`}>
                <h3 className="min-w-max pr-4 py-1 font-bold"> {card.urn ? card.urn : "NO UID"} </h3>
                <h3 className="min-w-max pr-4 py-1 font-bold"> {card.name ? card.name : "UNNAMED"} </h3>
                {
                    card.dob
                        ? <h3 className="min-w-max py-1 pr-4 font-bold"> {card.dob ? Math.floor((Date.now() - new Date(card.dob).getTime()) / 3.15576e+10).toString() + "yo" : ""} </h3>
                        : ""
                }
                <div className="w-full"></div>
                <p className="min-w-max py-1 text-[0.5rem]"> {getOffsetTimeString(new Date(card.timestamp))} </p>
            </div>

            <div className="text-white/70 w-full px-2 pb-2 italic">
                {card.summary ? card.summary : "NO SUMMARY"}
            </div>
        </div>
    )

    const openHeader = (
        <div className={`h-[140px] sm:h-[100px]`}>
            <div className={`text-white p-2 flex flex-row items-center flex-wrap`}>
                <h3 className="min-w-[80px] pr-4 py-1 font-bold urn-placeholder"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleUrnEdit}
                >
                    {card.urn ? card.urn : ""}
                </h3>
                <h3 className="min-w-[95px] pr-4 py-1 font-bold name-placeholder"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleNameEdit}
                >
                    {card.name ? card.name : ""}
                </h3>
                <div className="flex flex-row items-center pt-2 sm:pl-5 sm:pt-0">
                    <p className="text-white/70 font-bold pr-2">DOB: </p>
                    <div className="mr-2">
                        <DatePicker
                            value={card.dob ? new Date(card.dob) : null}
                            onChange={(date: Date) => { handleDobEdit(date) }}
                            disableCalendar={true}
                        />
                    </div>
                </div>
                {
                    card.dob
                        ? <h3 className="min-w-max py-1 pr-4 font-bold"> {card.dob ? Math.floor((Date.now() - new Date(card.dob).getTime()) / 3.15576e+10).toString() + "yo" : ""} </h3>
                        : ""
                }
            </div>
            <div className="text-white bg-white/10 w-full px-2 p-2 italic summary-placeholder whitespace-pre-wrap"
                contentEditable
                suppressContentEditableWarning={true}
                onInput={handleSummaryEdit}
            >
                {card.summary ? card.summary : ""}
            </div>

        </div>
    )

    // TW class strings for open/closed conditions
    const closedCardStyle = `bg-white/10 max-w-[800px] h-min w-[calc(90vw)] min-h-[20px] rounded-lg border-2 border-${borderColour} text-[0.85rem] sm:text=[1rem]`
    const openCardStyle = (`bg-gray-800/50 max-w-[800px] max-h-[800px] w-[calc(90vw)] h-[calc(60vh)] rounded-lg border-2 border-${borderColour} text-[0.85rem] sm:text=[1rem] `
     + `z-50 fixed left-1/2 top-[5%] sm:top-[10%] transform -translate-x-1/2`
    )

    const newCardJSX = (
        <div className={openCard == "open" ? openCardStyle : closedCardStyle}>
            {openCard == "open" ? <>{openHeader}</> : <>{closedHeader}</>}

            <div
                className={`rounded-lg ${openCard == "open" ? "" : "hidden"} h-full`}
            >
                <div className="text-white w-full max-h-[calc(60vh-210px)] sm:max-h-[calc(60vh-160px)] h-full px-2 pb-3 pt-2 content-placeholder overflow-auto whitespace-pre-wrap"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleContentEdit}
                >
                    {card.content ? card.content : ""}
                </div>
                <div
                    className="flex flex-row w-full gap-6 bg-white/10 items-center py-2 px-2 h-[60px]"
                >
                    <IconButton className="w-20 ml-4" size="sm" color="yellow" onClick={deselectCard}>
                        <i className=" fas fa-ban text-[1rem]" />
                    </IconButton>
                    <IconButton size="sm" className="w-20" onClick={handleSaveCard}>
                        <i className="fas fa-check text-[1rem]" />
                    </IconButton>
                    <div className="container">
                        <Select
                            placeholder="Progress Status"
                            options={options}
                            isClearable={false}
                            menuPlacement={"top"}
                            defaultValue={{label: card.status, value:card.status}}
                            onChange={(e) => { handleStatusEdit(e?.label) }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )


    return (
        <>
            {
                selected == card.cardId ?
            <animated.div
                className="bg-black fixed top-0 left-0 h-[calc(100vh)] w-[calc(100vw)]"
                onClick={() => {handleSaveCard(); deselectCardSimple()}}
                style={bgProps} /> :
                ""
            }
            {newCardJSX}
        </>
    )
}

export default Card;
