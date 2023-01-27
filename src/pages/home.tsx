import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import Header from '../components/head';
import NavBar from '../components/navbar';
import Card from '../components/card';
import Select from 'react-select'

import { Fragment, useState, useContext, useCallback } from 'react';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database.config";
import { v4 as uuidv4 } from 'uuid';

import { api } from "../utils/api";

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

export async function getServerSideProps(context) {
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

const Status = {
    Pending: 'Pending',
    Seen: 'Seen',
    Completed:'Completed',
    Transfer: 'Transfer',
    Other: 'Other',
} as const;

const HomePage: NextPage = ({ initialSession, user }) => {

    // GET PREVIOUS VALUES FROM INDEXEDDB STORE
    const userState = useLiveQuery(
        async () => db.state
        .where("id")
        .equals(user.id)
        .toArray()
    );
    const userCards = useLiveQuery(
        async () => db.cards
        .where("uid")
        .equals(user.id)
        .toArray()
    );

    // process options for status filter selection
    const options = []
    for (const k in Status) {
        options.push({
            value: Status[k],
            label: Status[k]
        })
    }

    // process options for card search
    const cardOptions = [{label: "12345 test name", value: "slkdf1231"}]
    if (userCards) {
        for (const k in userCards) {
            cardOptions.push({
                value: userCards[k]?.cardId,
                label: userCards[k]?.urn + " " + userCards[k]?.name
            })
        }
    }

    // DEFINE STATE VARIABLES HERE
    const [filter, setFilter] = useState({
        status: options.filter(
            (e) => e.value == Status.Pending |
                e.value == Status.Seen |
                e.value == Status.Transfer
            ),
        from: new Date(Date.now() - (1*24*60*60*1000)),
        to: new Date(Date.now() + (1*24*60*60*1000)),
        urn: "",
    });
    const [filterOpen, setFilterOpen] = useState(0);
    const [cards, setCards] = useState([]);

    // return null while waiting dexie queries
    if (!userState) return null
    if (!userCards) return null

    // handlers for time range change
    function handleFromChange(e) {
        console.log("from change", e)
        // TODO change state of filter
    }

    function handleToChange(e) {
        console.log("to change", e)
        // TODO change state of filter
    }

    function handleStatusChange(e) {
        console.log("status change", e)
        // TODO change state of filter
    }

    function handleSearchChange(e) {
        console.log("search change", e)
        // TODO change state of filter
    }

    //
    const handleFilterOpen = (value) => {
    console.log("open", value)
    setFilterOpen(filterOpen === value ? 0 : value);
    };

    // handler to add card
    function addCard() {
        // TODO add card to dexiedb and create editable card component
        const newCard = {
            uid: user.id,
            cardId: uuidv4(),
            name: "",
            urn: "",
            timestamp: Date.now(),
            content: "",
            summary: "",
            status: Status.Pending,
            notes: [],
        }
        console.log("adding", newCard)
        db.cards.add(newCard);
    }

    // handler to trigger filter
    function filterCards() {
        // TODO filter deck and rerender
    }

    function getOffsetTimeString(date: Date) {
        const offset = new Date(date.getTime() - date.getTimezoneOffset()*60*1000)
        console.log("offset", offset);
        return offset.toISOString().substring(0,19)
    }

    // filter and sort cards
    const cardsDisplay = userCards
        .map((c) => {
            return (<Card card={c} cards={cards} setCards={setCards} filter={filter} setFilter={setFilter}/>)
            /* return (<p>{c.uid}</p>) */
        })
    console.log("visualise usercards", userCards)

    return (
        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>
            <main className="flex h-[calc(100vh-64px)] items-center flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-[0.7rem] sm:text-[0.9rem]">
                <div className = "flex flex-col sm:px-4 px-2 max-w-[500px] overflow-auto h-full">
                    <div className="flex flex-row w-full h-max">
                    </div>
                    <Accordion open={filterOpen === 1} className="pb-2">
                        <AccordionHeader onClick={() => handleFilterOpen(1)} className="!text-white !p-2">
                            <div className="flex h-full flex-row">
                                <h1 className="flex text-[1.5rem] h-max w-full font-extrabold tracking-tight text-white py-2 pl-2 sm:text-[2rem]">
                                    On <span className="text-[hsl(280,100%,70%)]">Call</span>
                                </h1>
                            </div>
                        </AccordionHeader>
                        <AccordionBody>
                            <Select
                                className="basic-multi-select"
                                onChange={handleStatusChange}
                                isMulti
                                isClearable={false}
                                defaultValue={filter.status}
                                options={options}
                            />
                            <Select
                                className="basic-multi-select pt-2"
                                onChange={handleSearchChange}
                                placeholder="Search URN or name"
                                options={cardOptions}
                                isClearable={true}
                            />
                            <div className="flex max-w-[100vw - 100px] mb-4 p-1 flex-row flex-wrap sm:flex-nowrap text-white font-bold">
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
                                    <div className="flex w-max sm:pl-4 sm:pr-2">To: </div>
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
                        </AccordionBody>
                    </Accordion>
                    {cardsDisplay}
                </div>
                <div className="p-2">
                    <Menu placement="top">
                        <MenuHandler>
                            <Button className="bg-[hsl(280,100%,70%)]">action</Button>
                        </MenuHandler>
                        <MenuList className="bg-white/20">
                            <MenuItem className="text-white text-center">
                                Export PDF
                            </MenuItem>
                            <MenuItem className="text-white text-center">
                                Add Card
                            </MenuItem>
                        </MenuList>

                    </Menu>
                </div>
            </main>
            <NavBar />
        </>
    )
}

export default HomePage;
