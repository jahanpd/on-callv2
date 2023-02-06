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
    cards: Array<CardType>
    selected: string
    setSelected: Dispatch<SetStateAction<string>>
}

const Card = ({ card, cards, selected, setSelected }: Props) => {
    const value = useContext(AppContext);
    const deepCard = structuredClone(card);
    const alerts = value ? value.state.alerts : [];
    const setAlerts = value ? value.setAlerts : () => {[]};

    const supabaseClient = useSupabaseClient<Database>();
    const user = useUser();
    const [openCard, setOpenCard] = useState(false);
    const [cardState, setCardState] = useState(deepCard);

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
        setCardState(deepCard);
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
        cardState.urn = e.target.innerText;
        setCardState(cardState)
    }
    const handleNameEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        cardState.name = e.target.innerText;
    }
    const handleDobEdit = (e: Date | null) => {
        cardState.dob = e?.getTime();
    }
    const handleSummaryEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        cardState.summary = e.target.innerText;
    }
    const handleContentEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        cardState.content = e.target.innerText;
    }
    const handleStatusEdit = (e: string | undefined) => {
        const newStatus: Status = e ? Status[e as keyof typeof Status] : Status.Pending;
        cardState.status = newStatus;
    }

    if (!user) return null
    const handleSaveCard = () => {
        console.log(card);
        void (async () => {
            await db.cards.where("cardId").equals(cardState.cardId).modify(cardState);
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
    const borderColour: borderColourType = cardState.status == Status.Admitted  ||
                                           cardState.status == Status.Completed ||
                                            cardState.status == Status.Discharged  ? "green-500" :
                                            cardState.status == Status.Pending ? "red-500" :
                                            cardState.status == Status.Seen ? "orange-500" :
                                            cardState.status == Status.Transfer ? "cyan-500" : "white"


    const closedHeader = (
        <div onClick={selectCard}>
            <div className={`text-white/70 p-2 flex flex-row items-center`}>
                <h3 className="min-w-max pr-4 py-1 font-bold"> {cardState.urn ? cardState.urn : "NO UID"} </h3>
                <h3 className="min-w-max pr-4 py-1 font-bold"> {cardState.name ? cardState.name : "UNNAMED"} </h3>
                {
                    cardState.dob
                    ? <h3 className="min-w-max py-1 pr-4 font-bold" contentEditable> {cardState.dob ? Math.floor((Date.now() - new Date(cardState.dob).getTime()) / 3.15576e+10).toString() + "yo": ""} </h3>
                    : ""
                }
                <div className="w-full"></div>
                <p className="min-w-max py-1 text-[0.5rem]"> {getOffsetTimeString(new Date(cardState.timestamp))} </p>
            </div>

            <div className="text-white/70 w-full px-2 pb-2 italic">
                {cardState.summary ? cardState.summary : "NO SUMMARY"}
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
                    {cardState.urn ? cardState.urn : ""}
                </h3>
                <h3 className="min-w-[95px] pr-4 py-1 font-bold name-placeholder"
                    contentEditable
                    onInput={handleNameEdit}
                >
                    {cardState.name ? cardState.name : ""}
                </h3>
                <p className="text-white/70 font-bold pr-2">DOB: </p>
                <div className="mr-2">
                    <DatePicker
                        value={cardState.dob ? new Date(cardState.dob) : null}
                        onChange={(date: Date) => { handleDobEdit(date) }}
                        disableCalendar={true}
                    />
                </div>
                {
                    cardState.dob
                        ? <h3 className="min-w-max py-1 pr-4 font-bold" contentEditable> {cardState.dob ? Math.floor((Date.now() - new Date(cardState.dob).getTime()) / 3.15576e+10).toString() + "yo" : ""} </h3>
                        : ""
                }
            </div>
            <div className="text-white bg-white/10 w-full px-2 p-2 italic summary-placeholder"
                contentEditable
                onInput={handleSummaryEdit}
            >
                {cardState.summary ? cardState.summary : ""}
            </div>



        </div>
    )

    const newCardJSX = (
        <div className={`bg-white/10 max-w-[650px] h-min w-[calc(100vw-20px)] min-h-[20px] rounded-lg border-2 border-${borderColour} text-[0.85rem] sm:text=[1rem]`}>
            {openCard ? <>{openHeader}</> : <>{closedHeader}</>}

            <div className={`${openCard ? "h-fit" : "h-0 invisible"} rounded-lg`}>
                <div className="text-white w-full h-[150px] px-2 pb-3 pt-2 content-placeholder overflow-auto"
                    contentEditable
                    onInput={handleContentEdit}
                >
                    {cardState.content ? cardState.content : ""}
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
                        value={cardState.status?.toString()}
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
