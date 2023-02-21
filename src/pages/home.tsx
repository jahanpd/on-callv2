import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '../utils/supabaseTypes';
import type { ChangeEventHandler} from "react";
import type { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { User, Session } from '@supabase/auth-helpers-react';
import Header from '../components/head';
import NavBar from '../components/navbar';
import Card from '../components/card';
import Load from '../components/loading';
import Select from 'react-select'
import { type Filter as FilterType, SyncError, SeedError, Status } from '../types'
import { Alerts } from '../types'
import { clientRoutine } from '../checks-and-balance';

import AppContext from "../AppContext";
import { useState, useContext, useReducer, useEffect } from 'react';
import type { SetStateAction, Dispatch } from "react";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type Card as CardType } from "../database.config";
import { v4 as uuidv4 } from 'uuid';

import Alert from '../components/alert';
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import {
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
} from "@material-tailwind/react";
import { deleteCard, setDeleted } from "../supabase-helper"
import { checkDataSync } from "../checks-and-balance";
import PullToRefresh from 'react-simple-pull-to-refresh';
import { exportPdf, exportCsv, exportClipboard } from '../export-helpers';

import { useSpring, animated } from '@react-spring/web';


export const getServerSideProps: GetServerSideProps = async (context) => {
    const supabase = createServerSupabaseClient(context);
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session)
    return {
      redirect: {
          destination: '/auth',
          permanent: false,
      },
    }
    return {
        props: {
            initialSession: session,
            user: session.user,
        },
    }
}

// helper function for offsetting time
export function getOffsetTimeString(date: Date) {
    const offset = new Date(date.getTime() - date.getTimezoneOffset()*60*1000)
    return offset.toISOString().substring(0,19)
}

type Props = {
    initialSession: Session,
    user: User
}


const HomePage = ({ initialSession, user }: Props) => {
    const supabaseClient = useSupabaseClient<Database>();

    const value = useContext(AppContext);
    const alerts = value ? value.state.alerts : [];
    const setAlerts = value ? value.setAlerts : () => {[]};

    // this is a hacky solution to force refresh when alerts dismissed
    const [ignored, forceUpdater] = useReducer( (x: number) => x + 1, 0);

    function forceUpdate() {
        forceUpdater();
    }

    // GET PREVIOUS VALUES FROM INDEXEDDB STORE
    const userState = useLiveQuery(
        async () => await db.state
            .where("id")
            .equals(user.id)
            .first()
    );
    const userCards = useLiveQuery(
        async () => await db.cards
        .where("uid")
        .equals(user.id)
        .toArray()
    );

    // process options for status filter selection
    const options = []
    let k: keyof typeof Status;
    for (k in Status) {
        options.push({
            value: Status[k],
            label: Status[k]
        })
    }

    // process options for card search
    const cardOptions = []
    if (userCards) {
        for (const k of userCards) {
            if (k.urn || k.name) {
                cardOptions.push({
                    value: k?.cardId,
                    label: `${k.urn ? k.urn : ""} ${k.name ? k.name : ""}`
                })
            }
        }
    }

    // DEFINE STATE VARIABLES HERE
    const initFilter: FilterType = {
        status: options.filter((o) => o.value == Status.Pending || o.value == Status.Transfer || Status.Admitted || Status.Seen),
        from: new Date(Date.now() - (1*24*60*60*1000)),
        to: new Date(Date.now() + (1*24*60*60*1000)),
        urn: "",
        lastUse: 0
    }
    const [filter, setFilter]: [FilterType, Dispatch<SetStateAction<FilterType>>] = useState(initFilter);
    const [filterOpen, setFilterOpen] = useState(0);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        // checks and balances
        let  error: SeedError | undefined
        void (async () => {
            error = await clientRoutine(
                user,
                supabaseClient,
                db,
                value,
                "seedCheck"
            );
            if (error != SeedError.Passed) {
                if (alerts.filter(a => a.alert == error).length == 0 && error != SeedError.SupabaseRetrievalError) {
                    alerts.push(error ? {alert: error, timestamp: Date.now()} : {alert: Alerts.noSeed, timestamp: Date.now()})
                    setAlerts(alerts)
                } else if (error == SeedError.SupabaseRetrievalError) {
                    console.log("Internet likely not connected")
                }
            }
        })()
    }, [userState?.seedPhrase, userState?.id])

    // handle animating background on card open/close
    const bgProps = useSpring({
        from: { opacity: selected ? 0 : 0.8,
        },
        to: {
            opacity: selected ? 0.8 : 0,
        },
    })
    const fadeProps = useSpring({
        from: {
            opacity: selected ? 0 : 1,
        },
        to: {
            opacity: selected ? 1 : 0,
        },
        delay: 100
    })
    const fadePropsAlt = useSpring({
        from: {
            opacity: selected ? 1 : 0,
        },
        to: {
            opacity: selected ? 0 : 1,
        },
        delay: 100
    })

    // return null while waiting dexie queries
    if (!userState) return Load
    if (!userCards) return Load

    const sortFn = (a: CardType, b: CardType) => {return b.timestamp - a.timestamp;}
    userCards.sort(sortFn);


    // save filter to localdb
    const storeFilterLocal = () => {
        void (async () => await db.state.where("id").equals(user.id).modify(
            {filterLocal: filter}
        ))();
    }

    const resetFilter = () => {
        setFilter(initFilter)
        const reset = initFilter;
        reset.status = filter.status;
        void (async () => await db.state.where("id").equals(user.id).modify(
            {filterLocal: reset}
        ))();
    }

    if (filter != userState?.filterLocal) {
        if (userState?.filterLocal) {
            if (userState.filterLocal.lastUse) {
                // check if lastUse more than 8 hours ago
                if (Date.now() - userState.filterLocal.lastUse > 24*60*60*1000) {
                    initFilter.lastUse = Date.now()
                    resetFilter()
                }
            } else {
                userState.filterLocal.lastUse = Date.now()
            }
            setFilter(userState?.filterLocal)
        }
    }

    // handlers for time range change
    const handleFromChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("from change", e.target.value)
        filter.from = new Date(e.target.value)
        setFilter(filter)
        storeFilterLocal()
    }

    const handleToChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("to change", e.target.value)
        filter.to = new Date(e.target.value)
        setFilter(filter)
        storeFilterLocal()
    }

    const handleStatusChange = (e: Array<keyof typeof Status>) => {
        console.log("status change", e)
        filter.status = e.map((el) => { return {value: Status[el], label: Status[el]} })
        setFilter(filter)
        storeFilterLocal()
    }
    const handleSearchChange = (e: string | undefined) => {
        console.log("search change", e)
        filter.urn = e ? e : ""
        setFilter(filter)
        storeFilterLocal()
    }

    const handleFilterOpen = (value: number) => {
    setFilterOpen(filterOpen === value ? 0 : value);
    };

    console.log("HOME", selected)

    const handleRefresh = async () => {
        await clientRoutine(
                user,
                supabaseClient,
                db,
                value,
            );
    }

    // handler to add card
    async function addCard() {
        const newCard = {
            uid: user.id,
            cardId: uuidv4(),
            name: "",
            urn: "",
            timestamp: Date.now(),
            timestampEdit: Date.now(),
            content: "",
            summary: "",
            status: Status.Pending,
            notes: [],
        }
        console.log("adding", newCard)
        await db.cards.add(newCard);
        setSelected(newCard.cardId);
        forceUpdate();
    }

    async function deleteSelected() {
        if (!userCards) return
        for (const c of userCards) {
            if (c.cardId == selected) {
                if (!c) return
                await db.cards.where("cardId").equals(c.cardId).delete();
                // delete from supabase
                const msg1 = await deleteCard(supabaseClient, user, c.cardId)
                if (!msg1) {
                    alerts.push(
                        {alert: Alerts.supabaseDeleteFail, timestamp:Date.now()}
                    )
                    setAlerts(alerts)
                    forceUpdate()
                } else if (msg1 > 1) {
                    const msg2 = await setDeleted(supabaseClient, {
                        uid: user.id,
                        cardId: c.cardId,
                        timestamp: Date.now()
                    })
                    alerts.push(
                        {alert: Alerts.supabaseDeleteSuccess, timestamp:Date.now()}
                    )
                    setAlerts(alerts)
                    forceUpdate()
                    }
                }
            }
        console.log("card length", userCards.length)
        forceUpdate();
    }

    const syncWithDatabase = async () => {
            const msg = await checkDataSync(
                user,
                supabaseClient,
                db,
            )
            if (msg != SyncError.Passed) {
                alerts.push(
                    {alert: Alerts.supabaseOperation, timestamp:Date.now()}
                )
                setAlerts(alerts)
                forceUpdate()
            }
    }


    const filterUrnName = (urn: string | undefined, name: string | undefined, filter: string | undefined) => {
        if (!filter) return true
        if (!urn && !name) return false
        const urnFilt = urn ? filter.includes(urn) : false
        const nameFilt = name ? filter.includes(name) : false
        return urnFilt || nameFilt
    }
    // filter and sort cards
    const cardsDisplayFilter = userCards
        .filter((c) => {
            return (
                filter.status.map(s => s.value.toString()).includes(c.status) &&
                filter.from <= new Date(c.timestamp) &&
                filter.to >= new Date(c.timestamp) &&
                filterUrnName(c.urn, c.name, filter.urn)
            )
        })
    const cardsDisplay = cardsDisplayFilter
        .map((c, i) => {
            return (
                <Card key={i} card={c} selected={selected} setSelected={setSelected} bgProps={bgProps} />
            )
        })

    const selectedCard = userCards
        .filter((c) => c.cardId == selected)

    console.log("visualise usercards", userCards)
    console.log("visualise usercards", cardsDisplay)

    // prep alert notifications
    const alerts_render = alerts.map(
        (a: {alert: Alerts | SeedError | SyncError, timestamp: number}, idx) => {return (<Alert key={idx} alertcontent={a.alert} alerts={alerts} setAlerts={setAlerts} force={forceUpdate}/>)}
    )


    // generate navlist for this page
    const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
        <li>
            <Menu placement="top">
                <MenuHandler>
                    <Button className="bg-[hsl(280,100%,70%)]">actions</Button>
                </MenuHandler>
                <MenuList className="bg-white">
                    <MenuItem className="text-center" onClick={() => void deleteSelected()}>
                        Delete Selected Card
                    </MenuItem>
                    <MenuItem className="text-center" onClick={() => void syncWithDatabase()}>
                        Sync with DB
                    </MenuItem>
                    <MenuItem className="text-center" onClick={() => exportPdf(cardsDisplayFilter)}>
                        Export Current to PDF
                    </MenuItem>
                    <MenuItem className="text-center" onClick={() => exportCsv(cardsDisplayFilter)}>
                        Export Current to CSV
                    </MenuItem>
                    <MenuItem className="text-center" onClick={() => void exportClipboard(cardsDisplayFilter)}>
                        Copy Summary to Clipboard
                    </MenuItem>
                </MenuList>
            </Menu>
        </li>
        <li>
            <Button variant="gradient" size="sm" className="mt-2 sm:mt-0 p-3 w-[100px]" color="white" onClick={() => void addCard()}>
                Add Card
            </Button>
        </li>
    </ul>)

    return (
        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>
            <main className="flex h-[calc(100vh)] w-[100vw] items-center flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-[0.7rem] sm:text-[0.9rem] overflow-auto">
                <div className = "flex flex-col px-4 w-full overflow-auto h-full items-center">
                    <Accordion open={filterOpen === 1} className={`pb-2 sm:max-w-screen-xl !w-[calc(100vw-20px)] z-20 ${selected ? "hidden" : ""}`}>
                        <AccordionHeader onClick={() => handleFilterOpen(1)} className="!text-white !p-2">
                            <div className="flex h-full flex-row">
                                <h1 className="flex text-[1.5rem] h-max w-full font-extrabold tracking-tight text-white py-2 pl-2 sm:text-[2rem]">
                                    On <span className="text-[hsl(280,100%,70%)]">Call</span>
                                </h1>
                            </div>
                        </AccordionHeader>
                        <AccordionBody className="!items-center ">
                            <Select
                                className="basic-multi-select"
                                onChange={(e) => { handleStatusChange(e.map(el => el.value)) } }
                                isMulti
                                isClearable={false}
                                defaultValue={filter.status}
                                options={options}
                            />
                            <Select
                                className="basic-multi-select pt-2"
                                onChange={(e) => { handleSearchChange(e?.label) } }
                                placeholder="Search URN or name"
                                options={cardOptions}
                                isClearable={true}
                            />
                            <div className="grid grid-cols-3 max-w-[100vw - 100px] mb-4 p-1 flex-row flex-wrap sm:flex-nowrap text-white font-bold items-center">
                                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 justify-items-start sm:justify-items-center">
                                    <div className="pr-2">
                                        <div className="flex w-max sm:pr-2">From: </div>
                                        <div className="flex w-max font-normal">
                                            <input
                                                className="bg-white/10"
                                                type="datetime-local"
                                                name="from"
                                                value={getOffsetTimeString(filter.from)}
                                                onChange={handleFromChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex w-max sm:pr-2">To: </div>
                                        <div className="flex w-max font-normal">
                                            <input
                                                className="bg-white/10"
                                                type="datetime-local"
                                                name="to"
                                                value={getOffsetTimeString(filter.to)}
                                                onChange={handleToChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 justify-items-end sm:justify-items-center">
                                    <Button onClick={resetFilter}>
                                        Reset Time
                                    </Button>
                                </div>
                            </div>
                        </AccordionBody>
                    </Accordion>
                    {!selected ?
                    <animated.div
                        className="bg-black fixed top-0 left-0 h-[calc(100vh)] w-[calc(100vw)]"
                        style={bgProps} /> :
                     ""
                    }
                    {selectedCard[0] ?
                     <animated.div style={fadeProps}>
                        <Card card={selectedCard[0]} selected={selected} setSelected={setSelected} bgProps={bgProps} />
                     </animated.div> :
                    <PullToRefresh onRefresh={handleRefresh}>
                            <div className="grid grid-cols-1 gap-4 justify-items-center">
                                {cardsDisplay}
                                <div className="flex flex-col w-full h-[calc(50vh)] items-center"/>
                            </div>
                    </PullToRefresh>
                    }
                </div>
            </main>
            <NavBar navList={navList} page="home" />
            {
                alerts.length > 0 ?
                                <div className="fixed top-[0%] h-[100vh] w-[100vw]">{alerts_render}</div>:
                                ""
            }
        </>
    )
}

export default HomePage;
