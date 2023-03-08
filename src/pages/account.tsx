import type { MouseEventHandler, ChangeEventHandler } from "react";
import type { GetServerSidePropsContext, PreviewData, NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useSupabaseClient, type User, type Session } from '@supabase/auth-helpers-react';
import type { Database } from '../utils/supabaseTypes';
import Header from '../components/head';
import NavBar from '../components/navbar';
import Alert from '../components/alert';
import Load from '../components/loading';
import AppContext from "../AppContext";
import { Alerts, SeedError, SyncError } from '../types';

import { clientRoutine } from '../checks-and-balance';

import { useLiveQuery } from "dexie-react-hooks";
import { db, type State } from "../database.config";

import { useState, useContext, useCallback, useEffect} from 'react';

export async function getServerSideProps(context: GetServerSidePropsContext<any, PreviewData> | { req: NextApiRequest; res: NextApiResponse<any>; }) {
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
    // TODO get userstate from supabase
    return {
        props: {
            initialSession: session,
            user: session.user,
            userStateServer: undefined,
        },
    }
}

type Props = {
    initialSession: Session,
    user: User
    userStateServer: undefined | State
}

const Account = ({ initialSession, user, userStateServer }: Props) => {
    const value = useContext(AppContext);
    const alerts = value ? value.state.alerts : [];
    const setAlerts = value ? value.setAlerts : () => {[]};

    const supabase = useSupabaseClient<Database>();

    // this is a hacky solution to force refresh when alerts dismissed
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState(undefined), []);


    // GET PREVIOUS VALUES FROM INDEXEDDB STORE
    const userState: State | undefined = useLiveQuery(
        async () => db.state
        .where("id")
        .equals(user.id)
        .first()
    );

    // SET STATE VARIABLES
    const [editing, setEditing] = useState(false);
    const [seedPhraseEdit, setSeedPhraseEdit] = useState("");
    const [lookback, setLookback] = useState(0);

    let seedPhraseEditTemp = seedPhraseEdit;

    let lookbackTemp = userState ? userState?.lookback : lookback;

    useEffect(() => {
        // checks and balances
        void clientRoutine(
            user,
            supabase,
            db,
            value,
        );
    }, [userState?.seedPhrase, userState?.id])

    console.log("Account check user state:", userState)

    // if not userState, initialize one
    if (!userState) return Load

    // override userState with userStateServer if different
    if (userStateServer) {
        if (userStateServer != userState) {
            void (async () => await db.state.where("id").equals(user.id).modify(userStateServer))();
        }
    }

    // SET STATE HANDLERS
    // TODO PUSH STATE TO SUPABASE ON CHANGE OR SAVE

    const handleSeedEdit: ChangeEventHandler<HTMLInputElement> = (e) => {
        seedPhraseEditTemp = e.target.innerText
    };

    const handleNumberFocus: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("focusout", e.target.value)
    }

    const handleNumberChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log("focusout", e.target.value)
        void (async () => await db.state.where("id").equals(user.id).modify({lookback: e.target.value}))();

        setLookback(parseFloat(e.target.value));
        lookbackTemp = parseFloat(e.target.value);
    }

    const handleSeedSave: MouseEventHandler<HTMLButtonElement> = () => {
        console.log("handle save", seedPhraseEditTemp)
        void (async () => await db.state.where("id").equals(user.id).modify({seedPhrase: seedPhraseEditTemp}))();
        setEditing(!editing);
        // TODO update supabase records with new encryption
        // TODO update seed phrase hash
    };

    function editing_toggle() {
        const phrase = userState ? userState?.seedPhrase : ""
        setSeedPhraseEdit(phrase ? phrase : "")
        setEditing(!editing);
        /* setSeedPhraseEdit(userState[0]?.seedPhrase) */
    }

    // process alerts
    const alerts_render = alerts.map(
        (a: {alert: Alerts | SeedError | SyncError, timestamp: number}, idx) => {return (<Alert key={idx} alertcontent={a.alert} alerts={alerts} setAlerts={setAlerts} force={forceUpdate}/>)}
    )

    const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
    </ul>
    )


    return (
        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>
            <main className="flex h-[calc(100vh)] flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] overflow-auto">
                <div className="w-full sm:max-w-screen-xl absolute left-1/2 transform -translate-x-1/2">
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
                              onClick={handleSeedSave}
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
                    <div className="border-4 border-r-white p-5 sm:p-4 rounded-xl min-w-fit align-middle"><p>Lookback</p></div>
                    <input
                        type="number"
                        className="p-0 pl-2 font-normal bg-white/0 text-center"
                        min="0" max="1000"
                        onBlur={handleNumberFocus}
                        onChange={handleNumberChange}
                        value={lookbackTemp}
                    />
                    <div
                        className="bg-white/0 text-white align-middle text-[0.5rem] my-4 p-2 sm:text-[0.7rem] font-normal mx-2 sm:mx-4 opacity-50"
                    >
                        The number of days back to sync with the database (default 14 days, set 0 to sync all data)
                    </div>
                </div>


                </div>
            </main>
            <NavBar navList={navList} page="other"/>
            {
                alerts.length > 0 ?
                <div className="fixed top-[0%] h-[100vh] w-[100vw]">{alerts_render}</div>:
                                ""
            }
        </>
    )
}

export default Account;
