import { type NextPage } from "next";
import Link from "next/link";
import Header from '../components/head';
import NavBar from '../components/navbar';
import { useSupabaseClient, type SupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, type NextRouter } from 'next/router';

const signOut = (supabase: SupabaseClient, router: NextRouter) => {
    void (async () => await supabase.auth.signOut())();
    void (async () => await router.push("/landing"))();
}

const LandingPage: NextPage = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
    </ul>
    )
    return (

        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>

            <main className="flex h-[calc(100vh)] flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
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
            <NavBar navList={navList} page="other"/>
        </>
    );
}

export default LandingPage;
