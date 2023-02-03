import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { type Status as StatusType, SyncError, Alerts } from '../types';
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
    setCards: Dispatch<SetStateAction<Array<CardType>>>
    selected: string
    setSelected: Dispatch<SetStateAction<string>>
    force: Dispatch<SetStateAction<null>>
}

const Status = {
    Pending: 'Pending',
    Seen: 'Seen',
    Completed:'Completed',
    Transfer: 'Transfer',
    Other: 'Other',
} as const;

const Card = ({ card, cards, setCards, selected, setSelected, force }: Props) => {
    const value = useContext(AppContext);
    const alerts = value ? value.state.alerts : [];
    const setAlerts = value ? value.setAlerts : () => {[]};

    const supabaseClient = useSupabaseClient<Database>();
    const router = useRouter();
    const user = useUser();
    const [openCard, setOpenCard] = useState(false);

    if (selected !== card.cardId && openCard) {
        setOpenCard(false)
    }

    const selectCard = () => {setSelected(card.cardId);  setOpenCard(true)};
    const deselectCard = () => {setSelected("");  setOpenCard(false)};

    const optionsStatus = []
    let k: keyof typeof Status;
    for (k in Status) {
        optionsStatus.push(
            <Option value={k.toString()} >{k}</Option>
        )
    }

    // handlers
    const handleUrnEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("urn change", e.target.innerText)
        card.urn = e.target.innerText;
    }
    const handleNameEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("name change", e.target.innerText)
        card.name = e.target.innerText;
    }
    const handleDobEdit = (e: Date | null) => {
        console.log("dob change", e);
        card.dob = e?.getTime();
    }
    const handleSummaryEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("summ change", e.target.innerText)
        card.summary = e.target.innerText;
    }
    const handleContentEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("cont change", e.target.innerText)
        card.content = e.target.innerText;
    }
    const handleStatusEdit = (e: string | undefined) => {
        console.log("status change", e)
        const newStatus: StatusType = e ? Status[e as keyof typeof Status] : Status.Pending;
        card.status = newStatus;
    }

    if (!user) return null
    const handleSaveCard = () => {
        console.log(card);
        void (async () => {
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
                force(null)
            }
        })();
    }

    const openCardJSX = (
        <div className="">
            <CardUI className="max-w-[650px] border border-2 w-[calc(100vw-20px)] flex flex-row" color="transparent">
                <div className="flex flex-col w-full text-white">
                    <div className="bg-white/10 w-full h-full px-2 pt-1 flex flex-row">
                        <h3 className="min-w-max pr-4 py-1 font-bold"
                            contentEditable
                            onInput={handleUrnEdit}
                        >
                            {card.urn ? card.urn : "NO UID"}
                        </h3>
                        <h3 className="min-w-max pr-4 py-1 font-bold"
                            contentEditable
                            onInput={handleNameEdit}
                        >
                            {card.name ? card.name : "UNNAMED"}
                        </h3>
                        <div className="mr-2">
                            <DatePicker
                                value={card.dob ? new Date(card.dob) : null}
                                onChange={(date: Date) => {handleDobEdit(date)}}
                                disableCalendar={true}
                            />
                        </div>
                        {
                            card.dob
                            ? <h3 className="min-w-max py-1 pr-4 font-bold" contentEditable> {card.dob ? Math.floor((Date.now() - new Date(card.dob).getTime()) / 3.15576e+10).toString() + "yo": ""} </h3>
                            : ""
                        }
                        <div className="w-full"></div>
                    </div>
                    <CardBody className="!p-0 w-full" color="pink">
                        <div className="bg-white/10 w-full px-2 pb-3 italic"
                             contentEditable
                             onInput={handleSummaryEdit}
                        >
                        {card.summary ? card.summary : "NO SUMMARY"}
                        </div>
                        <div className="bg-white/10 w-full px-2 pb-3"
                             contentEditable
                             onInput={handleContentEdit}
                        >
                            {card.content ? card.content : "NO CONTENT"}
                        </div>
                    </CardBody>
                    <CardFooter className="!p-0 items-center" color="pink">
                        <div className="flex flex-row w-full gap-6 bg-white/10 h-full items-center py-2 px-2">
                            <IconButton className="w-20 ml-4" size="sm" color="yellow" onClick={deselectCard}>
                                <i className=" fas fa-ban text-[1rem]" />
                            </IconButton>
                            <IconButton size="sm" className="w-20" onClick={handleSaveCard}>
                                <i className="fas fa-check text-[1rem]" />
                            </IconButton>
                            <Select label="status" variant="static"
                                    className="text-white text-[0.8rem]"
                                    value={card.status?.toString()}
                                    onChange={handleStatusEdit}
                            >
                                {optionsStatus}
                            </Select>
                        </div>
                    </CardFooter>
                </div>
            </CardUI>
        </div>
    )

    const closedCardJSX = (
        <div onClick={selectCard} className="">
            <CardUI className="max-w-[650px] border border-2 w-[calc(100vw-20px)] flex flex-row" color="transparent">
                <div className="flex flex-col w-full">
                    <div className="bg-white/10 w-full h-full px-2 pt-1 flex flex-row">
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
                    <CardBody className="!p-0 w-full" color="pink">
                        <div className="bg-white/10 w-full px-2 pb-1 italic">
                            {card.summary ? card.summary : "NO SUMMARY"}
                        </div>
                        <div className="bg-white/10 w-full px-2 pb-1">
                            {card.content ? card.content.slice(0,20) + "..." : "NO CONTENT"}
                        </div>
                    </CardBody>
                </div>
            </CardUI>
        </div>
    )


    return (
        <>
            {openCard ? <>{openCardJSX}</> : <>{closedCardJSX}</>}
        </>
    )
}

export default Card;
