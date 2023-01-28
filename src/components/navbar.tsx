import Link from "next/link";
import { useUser } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import {
    Navbar,
    MobileNav,
    Typography,
    Button,
    IconButton,
} from "@material-tailwind/react";

const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
        <li>

        </li>
    </ul>)
type Props = {
    navList: typeof navList
}
const NavBar = ( {navList}: Props ) => {
    const user = useUser();
    const [openNav, setOpenNav] = useState(false);



    return (
        <Navbar className="!bg-white/10 mx-auto sm:max-w-screen-xl w-[80%] lg:px-8 lg:py-1 fixed top-[90%] sm:top-[93%] left-1/2 transform -translate-x-1/2 -translate-y-[95%]">
            <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
                <Typography
                    as="a"
                    href="#"
                    variant="small"
                    className="mr-4 cursor-pointer font-normal"
                >
                    <div
                        className="text-[2rem] font-bold tracking-tight text-white sm:text-[3rem]"
                    >
                        <Link
                            className = ""
                            href="/">O<span className="text-[hsl(280,100%,70%)]">C</span>
                        </Link>

                    </div>
                </Typography>

                <div className="hidden lg:block">{navList}</div>

                <Button variant="gradient" size="sm" className="hidden lg:inline-block" color="white">
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
                </Button>

                <IconButton
                    variant="text"
                    className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
                    ripple={false}
                    onClick={() => setOpenNav(!openNav)}
                >
                    {openNav ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            stroke="white"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            stroke="white"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </IconButton>
            </div>
            <MobileNav open={openNav}>
                <div className="container mx-auto items-center flex flex-col">
                    <Button variant="gradient" size="sm" className="mb-4 !w-[100px]" color="white">
                        <div className="font-bold tracking-tight">
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
                    </Button>
                    {user ?
                    <Button variant="gradient" size="sm" className="mb-4 !w-[100px]" color="white">
                        <Link
                            className = "text-[1rem]"
                            href="account">⚙️
                        </Link>
                    </Button>
                    : ""
                    }
                    {user ?
                    <Button variant="gradient" size="sm" className="mb-4 !w-[100px]" color="white">
                        <Link
                            className = ""
                            href="home">list
                        </Link>
                    </Button>
                    : ""
                    }

                    <div className="">{navList}</div>
                </div>
            </MobileNav>
        </Navbar>
    )
}

export default NavBar;
