import { type NextPage } from "next";
import Link from "next/link";
import Header from '../components/head';
import NavBar from '../components/navbar';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

const signOut = (supabase, router) => {
    supabase.auth.signOut();
    router.push("/landing");
}

const LandingPage: NextPage = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    return (

        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>

            <main className="flex h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <div className="grid grid-cols-1 gap-4 md:gap-8">
                        <Link
                            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                            href="landing"
                            onClick={() => signOut(supabaseClient, router)}
                        >
                            <h3 className="text-2xl font-bold text-center">Logout</h3>
                        </Link>
                    </div>
                </div>
            </main>
            <NavBar />
        </>
    );
}

export default LandingPage;
