import type { GetServerSideProps } from 'next';
import Link from "next/link";
import Header from '../components/head';
import { useUser } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import NavBar from '../components/navbar';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const supabase = createServerSupabaseClient(context);
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return {
            props: {
            }
        }
    }
    return {
      redirect: {
          destination: '/home',
          permanent: false,
      },
    }
}



const Authenticate = ( {} ) => {
    const supabase = useSupabaseClient();
    const user = useUser();

    if (user) {
        console.log("yolo")
    }
    const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
    </ul>
    )

    return (
            <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>

            <main className="flex h-[calc(100vh)] flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                {!user ?
                    <Auth
                    redirectTo="http://localhost:3000/home"
                    appearance={{ theme: ThemeSupa }}
                    supabaseClient={supabase}
                    socialLayout="horizontal"
                    theme="dark"
                    />
                    : <div className="grid grid-cols-1 gap-4 md:gap-8">
                        <Link
                            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                            href="home"
                        >
                            <h3 className="text-2xl font-bold text-center">Welcome {user.email ? user.email.split("@")[0] : ""}</h3>
                            <div className="text-lg text-center">
                                Get organised now.
                            </div>
                        </Link>
                    </div>
                }
            </main>
            <NavBar navList={navList}/>

            </>
    );
}

export default Authenticate;
