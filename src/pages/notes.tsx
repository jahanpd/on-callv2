import Header from '../components/head';
import NavBar from '../components/navbar';
import { IconButton } from "@material-tailwind/react";
import { useState, type ChangeEventHandler } from 'react';
import { Alert } from "@material-tailwind/react";
import { db, type Notes as NoteType } from "../database.config";
import { useLiveQuery } from "dexie-react-hooks";
import type { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { User, Session } from '@supabase/auth-helpers-react';
import { v4 as uuidv4 } from 'uuid';

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

type Props = {
    initialSession: Session,
    user: User
}

const NotePage = ({ initialSession, user }: Props) => {
    const [input, setInput] = useState("");
    const [direction, setDirection] = useState(1);

    // live query for notes
    const notes = useLiveQuery(
        async () => await db.notes.where({uid:user.id}).toArray()
    )


    if (!notes) return null
    const handleEnter = async () => {
        console.log("ENTER PRESSED !!!!!")
        await db.notes.add({
            uid: user.id,
            noteId: uuidv4(),
            note: input,
            timestamp: Date.now()
        })
        // save input to dexie and rerender
        setInput("")
        // save input to dexie
    }
    const removeNote = async (noteId: string) => {
        await db.notes.where({noteId: noteId}).delete()
    }
    console.log(notes)
    const noteFormatted = notes
        .sort((a, b) => direction * (a.timestamp - b.timestamp))
        .map( (n, i) => {
            return (
                <div key={i} className="flex flex-row mx-2 sm:mx-4 mt-4">
                    <Alert
                        icon={
                            <i className="fas fa-note-sticky"/>
                        }
                        animate={{
                            mount: { y: 0 },
                            unmount: { y: 100 },
                        }}
                        dismissible={{
                            onClose: () => void removeNote(n.noteId),
                        }}
                        color="indigo"
                    >
                        {n.note}
                    </Alert>
                </div>
                )
            }
        )
    // generate
    return (
        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>
            <main className="flex h-[calc(100vh)] w-[100vw] items-center flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-[0.7rem] sm:text-[0.9rem] overflow-auto">
                <div className = "flex flex-col px-4 w-full overflow-auto h-full sm:max-w-screen-xl !w-[calc(100vw-20px)]">
                    <div className="flex flex-row py-2">
                        <h1 className="flex text-[1.5rem] h-max w-full font-extrabold tracking-tight text-white py-2 pl-2 sm:text-[2rem]">
                            On <span className="text-[hsl(280,100%,70%)]">Call</span>
                        </h1>
                    </div>
                    <div className="flex w-full flex-row items-center">
                        <textarea
                            className="text-white bg-white/10 w-full px-2 p-2 italic max-h-[100px] overflow-auto text-[1rem]"
                            placeholder="write a note or task and press enter (not synced accross devices)"
                            onKeyDown={(e) => {if (e.key == "Enter") { void handleEnter() }}}
                            value={input}
                            onChange={e => setInput(e.target.value.replace("\n", ""))}
                        />
                        <IconButton className="w-20 ml-4" size="sm" color="white" onClick={() => setDirection(direction * -1)}>
                            <i className="fas fa-sort text-[1rem]" />
                        </IconButton>
                    </div>
                    <div className="pt-2 pr-10">
                        {noteFormatted}
                    </div>
                </div>
            </main>
            <NavBar navList="" page="other" />
        </>
    )
}

export default NotePage
