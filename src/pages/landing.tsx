import { type NextPage } from "next";
import Link from "next/link";
import Header from '../components/head';
import NavBar from '../components/navbar';


const LandingPage: NextPage = () => {
    return (

        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>

            <main className="flex h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                        On <span className="text-[hsl(280,100%,70%)]">Call</span>
                    </h1>
                    <div className="grid grid-cols-1 gap-4 md:gap-8">
                        <Link
                            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                            href="auth"
                        >
                            <h3 className="text-2xl font-bold text-center">Login/Signup</h3>
                            <div className="text-lg text-center">
                                Get organised now.
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
            <NavBar />
        </>
    );
}

export default LandingPage;
