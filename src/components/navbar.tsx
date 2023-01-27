import { type NextPage } from "next";
import Link from "next/link";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';


const NavBar: NextPage = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const user = useUser();
    return (
        <nav
            className="grid grid-cols-5 items-center h-[64px] justify-center text-center bg-gradient-to-b from-[#15162c] to-[#6634ad]"
        >
            <div
                className="text-[2rem] font-bold tracking-tight text-white sm:text-[3rem]"
            >
                 <Link
                     className = ""
                     href="/">O<span className="text-[hsl(280,100%,70%)]">C</span>
                 </Link>

            </div>
            <div></div>
            <div className="text-[1rem] font-bold tracking-tight text-white sm:text-[2rem]">
                {user ?
                 <Link
                     className = ""
                     href="account">⚙️
                 </Link> : ""
                }
            </div>
            <div className="text-[1rem] font-bold tracking-tight text-white sm:text-[2rem]">
                {user ?
                <Link
                    className = ""
                    href="/home">list
                </Link>: ""
                }

            </div>
            <div className="text-[1rem] font-bold tracking-tight text-white sm:text-[2rem]">
                {user ?
                 <Link
                     className = ""
                     href="logout"
                     >logout
                 </Link>
                :
                 <Link
                     className = ""
                     href="auth">login
                 </Link>
                }
            </div>
        </nav>
    )
}

export default NavBar;
