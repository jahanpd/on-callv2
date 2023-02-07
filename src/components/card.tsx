import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { Status, SyncError, Alerts } from '../types';
import type { SetStateAction, Dispatch } from "react";
import type { MouseEventHandler, ChangeEventHandler } from "react";
import { useState, useContext } from 'react';
import { getOffsetTimeString } from '../pages/home';
import { Select, Option, Alert } from "@material-tailwind/react";
import DatePicker from 'react-date-picker/dist/entry.nostyle';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    Card as CardUI,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    IconButton,
    Input
} from "@material-tailwind/react";
import { db, type Card as CardType } from "../database.config";
import { checkDataSync } from "../checks-and-balance";
import type { Database } from '../utils/supabaseTypes';
import AppContext from "../AppContext";

type Props = {
    card: CardType
    selected: string
    setSelected: Dispatch<SetStateAction<string>>
}

const Card = ({ card, selected, setSelected }: Props) => {

    const value = useContext(AppContext);
    const alerts = value ? value.state.alerts : [];
    const setAlerts = value ? value.setAlerts : () => {[]};

    const supabaseClient = useSupabaseClient<Database>();
    const user = useUser();
    const [openCard, setOpenCard] = useState(false);

    if (selected !== card.cardId && openCard) {
        setOpenCard(false)
    }

    const selectCard = () => {
        setSelected(card.cardId);
        setOpenCard(true)
    };
    const deselectCard = () => {
        setSelected("");
        setOpenCard(false);
        // this causes a rerender of the list to remove changes
        void (async () => {
            await db.cards.where("cardId").equals(card.cardId).modify((c: CardType) => {c.cardId = c.cardId});
        })()
    };

    const optionsStatus = []
    let k: keyof typeof Status;
    for (k in Status) {
        optionsStatus.push(
            <Option value={k.toString()} >{k}</Option>
        )
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

    if (!user) return null

    const handleSaveCard = () => {
        console.log(card);
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
                                           card.status == Status.Completed ||
                                            card.status == Status.Discharged  ? "green-500" :
                                            card.status == Status.Pending ? "red-500" :
                                            card.status == Status.Seen ? "orange-500" :
                                            card.status == Status.Transfer ? "cyan-500" : "white"


    const closedHeader = (
        <div onClick={selectCard}>
            <div className={`text-white/70 p-2 flex flex-row items-center`}>
                <h3 className="min-w-max pr-4 py-1 font-bold"> {card.urn ? card.urn : "NO UID"} </h3>
                <h3 className="min-w-max pr-4 py-1 font-bold"> {card.name ? card.name : "UNNAMED"} </h3>
                {
                    card.dob
                    ? <h3 className="min-w-max py-1 pr-4 font-bold" contentEditable> {card.dob ? Math.floor((Date.now() - new Date(card.dob).getTime()) / 3.15576e+10).toString() + "yo": ""} </h3>
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
        <div className={``}>
            <div className={`text-white p-2 flex flex-row items-center`}>
                <h3 className="min-w-[80px] pr-4 py-1 font-bold urn-placeholder"
                    contentEditable
                    onInput={handleUrnEdit}
                >
                    {card.urn ? card.urn : ""}
                </h3>
                <h3 className="min-w-[95px] pr-4 py-1 font-bold name-placeholder"
                    contentEditable
                    onInput={handleNameEdit}
                >
                    {card.name ? card.name : ""}
                </h3>
                <p className="text-white/70 font-bold pr-2">DOB: </p>
                <div className="mr-2">
                    <DatePicker
                        value={card.dob ? new Date(card.dob) : null}
                        onChange={(date: Date) => { handleDobEdit(date) }}
                        disableCalendar={true}
                    />
                </div>
                {
                    card.dob
                        ? <h3 className="min-w-max py-1 pr-4 font-bold" contentEditable> {card.dob ? Math.floor((Date.now() - new Date(card.dob).getTime()) / 3.15576e+10).toString() + "yo" : ""} </h3>
                        : ""
                }
            </div>
            <div className="text-white bg-white/10 w-full px-2 p-2 italic summary-placeholder"
                contentEditable
                onInput={handleSummaryEdit}
            >
                {card.summary ? card.summary : ""}
            </div>



        </div>
    )

    const newCardJSX = (
        <div className={`bg-white/10 max-w-[650px] h-min w-[calc(90vw)] min-h-[20px] rounded-lg border-2 border-${borderColour} text-[0.85rem] sm:text=[1rem]`}>
            {openCard ? <>{openHeader}</> : <>{closedHeader}</>}

            <div className={`${openCard ? "h-fit" : "h-0 invisible"} rounded-lg`}>
                <div className="text-white w-full h-[150px] px-2 pb-3 pt-2 content-placeholder overflow-auto"
                    contentEditable
                    onInput={handleContentEdit}
                >
                    {card.content ? card.content : ""}
                </div>
                <div className="flex flex-row w-full gap-6 bg-white/10 items-center py-2 px-2 h-fit">
                    <IconButton className="w-20 ml-4" size="sm" color="yellow" onClick={deselectCard}>
                        <i className=" fas fa-ban text-[1rem]" />
                    </IconButton>
                    <IconButton size="sm" className="w-20" onClick={handleSaveCard}>
                        <i className="fas fa-check text-[1rem]" />
                    </IconButton>
                    <Select label="status" variant="static"
                        className="text-white text-[0.8rem] pt-1"
                        value={card.status?.toString()}
                        onChange={handleStatusEdit}
                    >
                        {optionsStatus}
                    </Select>
                </div>
            </div>
        </div>
    )


    return (
        <>
            {newCardJSX}
        </>
    )
}

export default Card;
