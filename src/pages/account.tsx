import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import Header from '../components/head';
import NavBar from '../components/navbar';
import Alert from '../components/alert';
import AppContext from "../AppContext";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database.config";
import { api } from "../utils/api";

import { useState, useContext, useCallback } from 'react';

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

const HomePage: NextPage = ({ initialSession, user }) => {
    const value = useContext(AppContext);
    const alerts = value.state.alerts;
    const setAlerts = value.setAlerts;

    // this is a hacky solution to force refresh when alerts dismissed
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    console.log(alerts);

    // GET PREVIOUS VALUES FROM INDEXEDDB STORE
    const userState = useLiveQuery(
        async () => db.state
        .where("id")
        .equals(user.id)
        .toArray()
    );

    // SET STATE VARIABLES
    console.log(userState);
    const [editing, setEditing] = useState(false);
    const [seedPhraseEdit, setSeedPhraseEdit] = useState("");
    const [lookback, setLookback] = useState(1);

    let seedPhraseEditTemp = seedPhraseEdit;

    let lookbackTemp = userState ? userState[0]?.lookback : lookback;
    lookbackTemp = lookbackTemp ? lookbackTemp : 1.0;


    if (!userState) {
        return null
    }
    // SET STATE HANDLERS

    function handleSeedEdit(e) {
        console.log(e.target.innerText)
        seedPhraseEditTemp = e.target.innerText
    };

    function handleNumberFocus(e) {
        console.log("focusout", e)
    }

    async function handleNumberChange(e) {
        console.log("focusout", e)
        const out = await db.state.put({lookback: e.target.value, id: user.id});
        setLookback(e.target.value);
        lookbackTemp = e.target.value;
    }

    async function handleSeedSave(e) {
        console.log("handle save", seedPhraseEditTemp)
        const out = await db.state.put({seedPhrase: seedPhraseEditTemp, id: user.id});
        setEditing(!editing);
        // TODO update supabase records with new encryption
        // TODO update seed phrase hash
    };

    function editing_toggle() {
        setSeedPhraseEdit(userState[0]?.seedPhrase)
        setEditing(!editing);
        /* setSeedPhraseEdit(userState[0]?.seedPhrase) */
    }

    // process alerts
    const test = ["test"];
    const alerts_render = alerts.map(
        (a: string) => {return (<Alert alertcontent={a} alerts={alerts} setAlerts={setAlerts} force={forceUpdate}/>)}
    )
    console.log(alerts_render)


    return (
        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>
            <main className="flex h-[calc(100vh-64px)] flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] overflow-auto">
                <h1 className="text-[2.2rem] font-extrabold tracking-tight text-white sm:text-[3rem] p-4">
                    Account <span className="text-[hsl(280,100%,70%)]">Settings</span>
                </h1>
                {userState ?
                 <div className="flex flex-row bg-white/10 rounded-xl text-white align-middle text-[0.9rem] sm:text-[1.1rem] font-bold mx-2 sm:mx-4">
                     <div className="border-4 border-r-white p-4 rounded-xl min-w-fit align-middle"><p>Seed Phrase</p></div>
                     {editing ?
                      <div className="p-4 w-full font-normal" contentEditable onInput={handleSeedEdit} id="seedEdit">
                          {seedPhraseEdit}
                      </div> :
                      <div className="p-4 w-full font-normal">
                          ************ ************
                      </div>
                     }

                     {editing ?
                      <div className="flex flex-col">
                          <button
                              className="p-4 bg-red-300/40 border-1 border-red-400"
                              onClick={(e) => handleSeedSave(e)}
                          >save</button>
                          <button
                              className="p-4 bg-green-300/40 border-1 border-red-400"
                              onClick={editing_toggle}
                          >cancel</button>
                      </div>
                     :
                      <button
                          className="p-4 bg-green-300/40 border-1 border-red-400"
                          onClick={editing_toggle}
                      >edit</button>}

                 </div>
                :
                 <div className="flex flex-row bg-white/10 rounded-xl text-white align-middle text-[0.9rem] sm:text-[1.1rem] font-bold">loading</div>
                }
                <div
                    className="bg-white/10 text-white align-middle text-[0.5rem] my-4 p-2 sm:text-[0.7rem] font-normal mx-2 sm:mx-4 opacity-50"
                >
                    NOTE: The seed phrase is a unique sentence used to encrypt stored data on the server. It must be the same across devices. DO NOT LOSE THIS PHRASE.
                    While local data (on the phone browser or desktop) will still be accesible, if you lose this track of this phrase then you will need to save a new phrase.
                    This will encrypt local data and reupload it, but risks losing data if another device is ahead of the one doing the updating.

                </div>
                <div className="flex flex-row bg-white/10 rounded-xl text-white align-middle text-[0.9rem] sm:text-[1.1rem] font-bold mx-2 sm:mx-4">
                    <div className="border-4 border-r-white p-3 rounded-xl min-w-fit"><p>Lookback</p></div>
                    <input
                        type="number"
                        className="p-0 pl-2 font-normal bg-white/0 text-center"
                        min="1" max="1000"
                        onBlur={handleNumberFocus}
                        onChange={handleNumberChange}
                        value={lookbackTemp}
                    />
                    <div
                        className="bg-white/0 text-white align-middle text-[0.5rem] my-4 p-2 sm:text-[0.7rem] font-normal mx-2 sm:mx-4 opacity-50"
                    >
                        The default number of days the filter will lookback
                    </div>
                </div>

                <div className="h-full"></div>

                <div className="text-white align-middle text-[0.9rem] sm:text-[1.1rem] font-bold mx-2 sm:mx-4">Alerts </div>
                {
                    alerts.length > 0 ?
                    <div className="min-h-[64px]">{alerts_render}</div>:
                    <div className="text-white align-middle text-[0.7rem] sm:text-[0.9rem] font-normal mx-2 sm:mx-4 min-h-[64px]">None</div>
                }

            </main>
            <NavBar />
        </>
    )
}

export default HomePage;
